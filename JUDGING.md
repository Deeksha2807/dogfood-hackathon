# Judging Engine Specification & Implementation Documentation

This document outlines the architecture, mathematical specifications, assumptions, and integrity guarantees of the Hackathon Judging Engine (Phase T2).

---

## 1. Specification Requirements vs. Implementation Choices

To maintain architectural transparency and judging integrity, this section clearly separates what was strictly specified by the hackathon requirements versus what represents an engineering implementation choice:

| Topic | Hackathon Specification Requirement | Implementation Choice / Assumption |
| :--- | :--- | :--- |
| **Judge Invitations** | Organizer-controlled, event-scoped, validated states (`PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED`), email verification. | 168-hour (7 days) default expiration window. Token is 32-byte cryptographic hex. |
| **Judge Assignments** | Connects `event → judge → submission`. Only organizers assign. Judge must have `JUDGE` role. Submission must be submitted (not draft). Conflict of interest protection. | Deterministic round-robin distribution for batch assignment. |
| **Rubric Configuration** | Configurable weighted criteria using basis points (up to 10,000 basis points = 100.00%). Criteria snapshots preserved in evaluations. Locked rubrics immutable. | Locking validates that criteria weights sum to exactly 10,000 basis points. |
| **Access Isolation** | Judge sees only assigned submissions and event rubric. Cannot see/modify unassigned submissions or other judges' evaluations. Cannot view private scores before release. | Strict middleware-level and service-level verification (dual enforcement). |
| **Raw Scoring** | Calculated deterministically from configured weights and server-side range validation. Raw scores immutable. | Formula: $\sum_{c} \left(\frac{\text{score}_c}{\text{maxPoints}_c} \times \frac{\text{weightBasisPoints}_c}{10000} \times 100\right)$ yielding a standard 0–100 scale. |
| **Normalization** | Cross-judge score normalization is **required** to adjust for judge bias. Exact mathematical formula is **not specified** in the project requirements. | **Implementation Choice**: Standardized Z-Score normalization mapped to a target distribution ($\text{Mean}=75.0, \text{Std}=15.0$) with mean-shift fallback. |
| **Tie-Breaking** | Do **not** invent an official tie-breaking hierarchy if unspecified. Detect ties, preserve tied rank, and record `tieBreakerReason`. | Tied submissions share the exact same rank. Secondary sort by `submissionId` is used *strictly* for deterministic row ordering in API/CSV outputs and never creates an artificial rank winner. |
| **CSV Export** | Export final results with deterministic ordering and appropriate public headers. No secrets/passwords/tokens. | Formatted according to RFC 4180 with escaping of special characters. |
| **Auditability** | Record all key judging actions in the `AuditLog` table. | Audit entries recorded for invitations, assignments, rubrics, evaluations, calculations, and publications. |

---

## 2. Cross-Judge Score Normalization

### Mathematical Model (Implementation Choice)
Because judges vary in grading leniency and strictness, raw scores cannot always be compared directly across different judge pools. The normalization service adjusts for these variations:

1. **Judge Statistics**:
   For each judge $j$ who evaluated a non-empty set of submissions $S_j$:
   $$\mu_j = \frac{1}{|S_j|} \sum_{s \in S_j} R_{j,s}$$
   $$\sigma_j = \sqrt{ \frac{1}{|S_j|} \sum_{s \in S_j} (R_{j,s} - \mu_j)^2 }$$
   where $R_{j,s}$ is the raw total score assigned by judge $j$ to submission $s$.

2. **Target Distribution**:
   - $\text{Target Mean } (T_\mu) = 75.0$
   - $\text{Target Standard Deviation } (T_\sigma) = 15.0$
   - Threshold $\epsilon = 10^{-4}$

3. **Standard Case ($\sigma_j > \epsilon$)**:
   The Z-score represents how many standard deviations the score is above or below that judge's mean:
   $$Z_{j,s} = \frac{R_{j,s} - \mu_j}{\sigma_j}$$
   $$\text{Normalized}_{j,s} = \text{clamp}(T_\mu + T_\sigma \cdot Z_{j,s}, 0, 100)$$

4. **Zero-Variance / Single-Evaluation Fallback ($\sigma_j \le \epsilon$)**:
   If a judge gives identical scores to all assigned submissions (or evaluated only 1 submission), $\sigma_j \approx 0$. To prevent division-by-zero, a mean-shift fallback is applied:
   $$\text{Normalized}_{j,s} = \text{clamp}(R_{j,s} - \mu_j + T_\mu, 0, 100)$$

5. **Submission Aggregate**:
   For submission $s$ evaluated by completed evaluations $E_s$:
   $$\text{NormalizedScore}(s) = \frac{1}{|E_s|} \sum_{e \in E_s} \text{Normalized}_{j,s}$$
   $$\text{RawAverageScore}(s) = \frac{1}{|E_s|} \sum_{e \in E_s} R_{j,s}$$

### Integrity Properties
- **Non-destructive**: Raw scores in `Evaluation` and `EvaluationScoreItem` are never modified.
- **Missing Evaluation Safety**: Only actual completed evaluations are included in $E_s$. A missing evaluation is never zero-padded.
- **Determinism**: Identical evaluation inputs always yield identical normalized outputs.

---

## 3. Tie-Breaking and Rank Determination

### Rule: No Undocumented Tie-Break Hierarchy
Because the hackathon specification does not mandate an official tie-breaking hierarchy (such as raw score preference, submission timestamp, or team size), the engine implements **fair, non-arbitrary tie handling**:

1. **Equal Ranks for Equal Scores**:
   If Submission A and Submission B both attain a final composite score of $85.0000$, both submissions receive the **same rank** (e.g., both receive Rank 1).
2. **Explicit Tie Documentation**:
   `tieBreakerReason` is populated whenever a tie exists:
   `"Tied at composite score 85.0000 (unresolved tie; no official tie-breaker specified)"`
   When scores are distinct, `tieBreakerReason` is `null`.
3. **Deterministic Row Output vs. Rank Winner**:
   To ensure reproducible database queries and stable CSV rows, records are ordered deterministically by:
   - Primary: `finalCompositeScore DESC`
   - Secondary: `submissionId ASC` (output ordering only; **does not affect rank**)
4. **Track Ranking**:
   Track ranks follow the same rule: ties within a track share the identical `trackRank`.

---

## 4. Historical Snapshots & Immutability

When a judge submits an evaluation, historical snapshots of the criterion at that point in time are recorded in `EvaluationScoreItem`:
- `criterionNameSnapshot`
- `weightSnapshot`
- `maxPointsSnapshot`

If an organizer later unlocks or modifies a rubric, existing evaluations maintain their historical integrity and score contributions.

---

## 5. Security & Access Control Matrix

| Action | Allowed Roles | Restrictions / Validations |
| :--- | :--- | :--- |
| Create / Revoke Judge Invitation | Organizer | Email must not already be an event judge; cannot revoke accepted invites. |
| Accept Judge Invitation | Invited User | Target email must match session user email; cannot be expired/revoked. |
| Create / Lock Rubric & Criteria | Organizer | Cannot modify locked rubric; total weights must sum to 10,000 bps to lock. |
| Create Judge Assignment | Organizer | Judge must have `JUDGE` role; submission cannot be draft; conflict of interest prevented. |
| View Assigned Submissions | Assigned Judge | Judge can only view submissions explicitly assigned to them. |
| Submit / Update Evaluation | Assigned Judge | Must evaluate every criterion; scores within `[0, maxPoints]`; locked after publication. |
| View Judge Progress | Judge (Self), Organizer (All) | Judges see only their own progress; organizers see aggregate and per-judge data. |
| Calculate / Publish Results | Organizer | Requires at least 1 completed evaluation; publication unlocks participant access. |
| View Final Results | Organizer, Public (post-publish) | Blocked for participants and public until organizer publishes results. |
| Export Results CSV | Organizer | Sanitized RFC-4180 CSV export; zero secret/token leakage. |
