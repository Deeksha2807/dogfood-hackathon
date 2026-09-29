# Hackathon Management & Judging Platform - API Contract Specification

This document provides the definitive REST API specification and frontend integration contract for the Dogfood | 72-Hour Hackathon Platform backend.

Base URL: `http://localhost:5000` (or configured `PORT`)
Content-Type: `application/json`
Authentication: HTTP-only session cookie (`session_token`) or `Authorization: Bearer <token>`

---

## 1. Response & Error Structure

All successful responses return JSON objects. Error responses adhere to the standard schema:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable explanation of the error.",
  "details": {
    "field": ["Field specific validation error"]
  }
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Reasons |
| :--- | :--- | :--- |
| `200` | OK | Successful GET, PATCH, or non-creation POST. |
| `201` | Created | Resource successfully created. |
| `400` | Bad Request | Validation error, malformed UUID, missing required fields. |
| `401` | Unauthorized | Unauthenticated request; missing or expired session. |
| `403` | Forbidden | Insufficient role permissions or accessing unassigned resource. |
| `404` | Not Found | Resource (event, team, submission, user) does not exist. |
| `409` | Conflict | Duplicate entity (email, 1 team per user, duplicate vote). |
| `422` | Unprocessable Entity | Business rule violation (deadline expired, draft voting). |
| `429` | Too Many Requests | Rate limit exceeded (sliding window protection). |
| `500` | Internal Server Error | Unexpected server runtime exception. |

---

## 2. Health Check Endpoints

### `GET /health` & `GET /api/health`
Returns the operational status, timestamp, uptime, and node environment.

**Request:** None  
**Response (`200 OK`):**
```json
{
  "status": "ok",
  "timestamp": "2026-09-29T14:00:00.000Z",
  "uptime": 124.5,
  "environment": "production"
}
```

---

## 3. Authentication & Sessions (`/api/auth`)

### `POST /api/auth/register`
Registers a new user account with Argon2id password hashing.

**Request Body:**
```json
{
  "name": "Jane Developer",
  "email": "jane@example.com",
  "password": "Password123!Secure"
}
```

**Response (`201 Created`):**
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": "uuid-v4",
    "email": "jane@example.com",
    "name": "Jane Developer",
    "globalRole": "USER",
    "isActive": true
  }
}
```

### `POST /api/auth/login`
Authenticates credentials, generates a cryptographically random session token (32-byte hex), hashes it via SHA-256 for database storage, and attaches an HTTP-only cookie.

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!Secure"
}
```

**Response (`200 OK`):**
- Headers: `Set-Cookie: session_token=<token>; Path=/; HttpOnly; SameSite=Lax`
```json
{
  "message": "Login successful.",
  "user": {
    "id": "uuid-v4",
    "email": "jane@example.com",
    "name": "Jane Developer",
    "globalRole": "USER",
    "isActive": true
  }
}
```

### `GET /api/auth/me`
Resolves the currently authenticated session and user details.

**Authentication:** Required  
**Response (`200 OK`):**
```json
{
  "user": {
    "id": "uuid-v4",
    "email": "jane@example.com",
    "name": "Jane Developer",
    "globalRole": "USER",
    "isActive": true
  }
}
```

### `POST /api/auth/logout`
Invalidates the current session token in the database and clears the session cookie.

**Authentication:** Required  
**Response (`200 OK`):**
```json
{
  "message": "Logged out successfully."
}
```

---

## 4. User Management (`/api/users`)

### `GET /api/users`
Lists platform users with search, role filters, and pagination.

**Authentication:** Required (Admin or Organizer)  
**Query Parameters:**
- `search` (optional): Filter by name or email.
- `globalRole` (optional): `SUPER_ADMIN` | `USER`.
- `isActive` (optional): `true` | `false`.
- `page` (optional, default `1`): Page number.
- `limit` (optional, default `20`): Page size.

**Response (`200 OK`):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "alex.rivera@example.com",
      "name": "Alex Rivera",
      "globalRole": "SUPER_ADMIN",
      "isActive": true,
      "createdAt": "2026-09-28T00:00:00.000Z",
      "updatedAt": "2026-09-28T00:00:00.000Z",
      "eventRoles": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### `GET /api/users/:userId`
Retrieves a user profile with associated event roles and teams.

**Authentication:** Required (Self, Admin, or Organizer)  
**Response (`200 OK`):**
```json
{
  "user": {
    "id": "uuid",
    "email": "sam.chen@example.com",
    "name": "Samantha Chen",
    "globalRole": "USER",
    "isActive": true,
    "eventRoles": [
      {
        "role": "JUDGE",
        "event": {
          "id": "event-uuid",
          "name": "Autonomous AI Hackathon 2026",
          "status": "ACTIVE"
        }
      }
    ]
  }
}
```

### `PATCH /api/users/:userId`
Updates user status or role (Admin only). Inactivating a user immediately revokes their active sessions.

**Authentication:** Required (`SUPER_ADMIN`)  
**Request Body:**
```json
{
  "name": "Samantha Chen",
  "isActive": false,
  "globalRole": "USER"
}
```

**Response (`200 OK`):**
```json
{
  "user": {
    "id": "uuid",
    "email": "sam.chen@example.com",
    "name": "Samantha Chen",
    "globalRole": "USER",
    "isActive": false
  }
}
```

---

## 5. Hackathon Events (`/api/events`)

### `GET /api/events`
Lists all hackathon events with pagination, status filtering, and search.

**Authentication:** Optional (Public)  
**Query Parameters:**
- `status` (optional): `UPCOMING` | `ACTIVE` | `COMPLETED`.
- `search` (optional): Search by event name or description.
- `page` (optional, default `1`).
- `limit` (optional, default `20`).

**Response (`200 OK`):**
```json
{
  "events": [
    {
      "id": "00000000-0000-4000-8000-000000000001",
      "name": "Autonomous AI & Developer Hackathon 2026",
      "description": "72-hour autonomous systems hackathon",
      "status": "ACTIVE",
      "startDate": "2026-10-01T00:00:00.000Z",
      "endDate": "2026-10-04T00:00:00.000Z",
      "submissionDeadline": "2026-10-03T18:00:00.000Z",
      "judgingDeadline": "2026-10-03T23:59:59.000Z",
      "resultsPublished": false,
      "maxTeamSize": 4,
      "tracks": [
        { "id": "uuid", "name": "Autonomous Agents" }
      ],
      "prizes": [
        { "id": "uuid", "name": "Grand Prize", "cashValue": "10000.00" }
      ],
      "_count": {
        "teams": 12,
        "submissions": 10
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

### `POST /api/events`
Creates a new event. Creator is atomically bound as event `ORGANIZER`.

**Authentication:** Required  
**Request Body:**
```json
{
  "name": "NextGen AI Hackathon",
  "description": "Building agentic workflows",
  "status": "UPCOMING",
  "startDate": "2026-11-01T00:00:00.000Z",
  "endDate": "2026-11-04T00:00:00.000Z",
  "submissionDeadline": "2026-11-03T18:00:00.000Z",
  "judgingDeadline": "2026-11-03T23:59:59.000Z",
  "maxTeamSize": 5
}
```

**Response (`201 Created`):** Returns the created event object.

### `GET /api/events/:eventId`
Retrieves comprehensive details for an event including tracks, prizes, and counts.

**Authentication:** Required  
**Response (`200 OK`):** Returns `{ "event": { ... } }`.

### `PATCH /api/events/:eventId`
Updates event configuration (organizer only). Enforces timeline hierarchy server-side.

**Authentication:** Required (`ORGANIZER`)  
**Request Body:** (any subset of event fields or `resultsPublished: true`)  
**Response (`200 OK`):** Returns `{ "event": { ... } }`.

---

## 6. Tracks & Prizes

### `GET /api/events/:eventId/tracks`
Lists tracks configured for the event.

### `POST /api/events/:eventId/tracks`
Creates a new track. (Organizer only)  
**Request Body:** `{ "name": "Developer Tooling", "description": "Compilers and CLI agents" }`

### `GET /api/events/:eventId/prizes`
Lists prizes configured for the event.

### `POST /api/events/:eventId/prizes`
Creates a prize. (Organizer only)  
**Request Body:** `{ "name": "Best Solo Hack", "cashValue": 2500, "trackId": "optional-uuid" }`

---

## 7. Teams & Invitations (`/api/events/:eventId/teams`)

### `GET /api/events/:eventId/teams`
Lists teams in the event with track info, member counts, and project status.

**Query Parameters:** `search`, `trackId`, `page`, `limit`.  
**Response (`200 OK`):** Returns `{ "teams": [...], "pagination": {...} }`.

### `POST /api/events/:eventId/teams`
Creates a team. Creator is automatically set as `LEADER` and given `PARTICIPANT` role. Enforces 1 team per user per event.

**Request Body:**
```json
{
  "name": "AgentOps Core",
  "trackId": "uuid-track"
}
```
**Response (`201 Created`):** Returns `{ "team": { ... } }`.

### `GET /api/events/:eventId/teams/:teamId` & `GET /api/teams/:teamId`
Retrieves team details, member rosters, track, and submission.

### `PATCH /api/events/:eventId/teams/:teamId`
Updates team name or track preference. Restricted to team leader or organizer.

### `POST /api/events/:eventId/teams/:teamId/leave`
Allows a participant to leave a team. If the leader leaves and other members exist, leadership promotes to the next member. If the team is empty with no submission, the team record is cleaned up.

### `POST /api/events/:eventId/teams/:teamId/invites`
Generates a team invitation code and token.

**Request Body:**
```json
{
  "targetEmail": "peer@example.com",
  "maxUses": 3,
  "expiresInHours": 72
}
```
**Response (`201 Created`):** Returns `{ "invite": { "inviteCode": "A1B2C3D4", ... } }`.

### `POST /api/events/:eventId/team-invites/:inviteCode/accept`
Accepts a team invite. Enforces capacity (`maxTeamSize`), 1 team per event constraint, and target email match if specified.

---

## 8. Submissions & Project Gallery (`/api/events/:eventId/submissions` & `/api/projects`)

### `GET /api/events/:eventId/submissions` & `GET /api/projects`
Project Gallery API. Retrieves submissions with filtering, search, and pagination.
Non-organizers see all submitted/evaluated projects and their own team's drafts.

**Query Parameters:**
- `trackId` (optional): Filter by track UUID.
- `search` (optional): Search in project name, tagline, or description.
- `status` (optional): `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `EVALUATED`.
- `isDraft` (optional): `true` | `false`.
- `shuffle` (optional): `true` (enables randomized presentation for fair community browsing).
- `page` (optional): Page number.
- `limit` (optional): Items per page.

**Response (`200 OK`):**
```json
{
  "submissions": [
    {
      "id": "uuid",
      "projectName": "AgentFlow Orchestrator",
      "tagline": "Autonomous agent coordination",
      "description": "Multi-agent runtime for distributed jobs",
      "repoUrl": "https://github.com/example/agentflow",
      "demoUrl": "https://demo.agentflow.local",
      "videoUrl": "https://youtube.com/watch?v=123",
      "isDraft": false,
      "status": "SUBMITTED",
      "track": { "id": "uuid", "name": "Autonomous Agents" },
      "team": {
        "id": "uuid",
        "name": "AgentOps Core",
        "members": [...]
      },
      "_count": {
        "votes": 14,
        "comments": 3
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

### `GET /api/events/:eventId/submissions/:submissionId` & `GET /api/projects/:submissionId`
Retrieves project details, team info, media links, and vote/comment counts.

### `POST /api/events/:eventId/submissions`
Creates a project submission for a team.
- Enforces deadline server-side: rejects with `422 SUBMISSION_DEADLINE_EXPIRED` if deadline passed.
- Enforces 1 submission per team.
- Enforces team membership.

### `PATCH /api/events/:eventId/submissions/:submissionId`
Edits a submission.
- Enforces deadline server-side: all edits past deadline return `422 SUBMISSION_DEADLINE_EXPIRED`.
- Restricted to submission's team members.

### `POST /api/events/:eventId/submissions/:submissionId/finalize`
Finalizes submission from `DRAFT` to `SUBMITTED`.
- Enforces deadline server-side.

---

## 9. Judging Engine (`/api/events/:eventId/judging`)

### `GET /api/events/:eventId/judges/invitations`
Lists judge invitations. (Organizer only)

### `POST /api/events/:eventId/judges/invitations`
Invites a judge by email with a 32-byte cryptographic token.

### `POST /api/events/:eventId/judges/invitations/:invitationId/accept`
Invited user accepts invitation, granting them the event `JUDGE` role.

### `POST /api/events/:eventId/judges/assignments`
Assigns a judge to a submission. Conflict of interest check prevents assigning judges to their own team.

### `POST /api/events/:eventId/judges/assignments/batch`
Executes deterministic round-robin assignment distributing $N$ judges per submission.

### `GET /api/events/:eventId/judging/assignments`
Judge view: retrieves only the submissions assigned to the calling judge.

### `GET /api/events/:eventId/judging/assignments/:assignmentId`
Judge view: retrieves assignment details and active rubric criteria for evaluation.

### `POST /api/events/:eventId/judging/assignments/:assignmentId/evaluation`
Submits evaluation.
- Verifies calling judge is assigned to this assignment.
- Validates all rubric criteria scores are within $[0, \text{maxPoints}]$.
- Calculates weighted raw score: $\sum (\text{score}_c / \text{max}_c \times \text{weight}_c / 10000 \times 100)$.
- Records historical criteria snapshots (`name`, `weight`, `maxPoints`).

### `GET /api/events/:eventId/judging/my-progress`
Judge view: returns personal completion stats (`totalAssignments`, `completedEvaluations`, `pendingEvaluations`, `progressPercentage`).

### `GET /api/events/:eventId/judging/progress`
Organizer view: returns overall event judging progress across all judges and submissions.

### `POST /api/events/:eventId/judging/final-results/calculate`
Calculates cross-judge Z-Score normalized scores and ranks. (Organizer only)

### `POST /api/events/:eventId/judging/final-results/publish`
Publishes final results. (Organizer only)

### `GET /api/events/:eventId/judging/final-results`
Retrieves final results.
- **Access Rule:** Organizer or Super Admin can view anytime.
- **Visibility Gate:** Public and participants receive `403 RESULTS_NOT_PUBLISHED` until `resultsPublished === true`.

### `GET /api/events/:eventId/judging/results.csv`
Exports final results as an RFC-4180 compliant sanitized CSV file. (Organizer only)

---

## 10. Community Voting & Comments (`/api/events/:eventId/community` & `/api/votes` & `/api/comments`)

### `POST /api/events/:eventId/community/submissions/:submissionId/vote` & `POST /api/votes`
Casts a community vote for a project.

**Security & Integrity Guarantees:**
1. **Rate Limiting:** Enforces maximum 10 requests per minute per IP and per fingerprint. Rejection returns `429 RATE_LIMIT_EXCEEDED`.
2. **Duplicate Prevention:** Rejects if user has already voted for this submission (`409 DUPLICATE_VOTE`) or if the fingerprint has already voted (`409 DUPLICATE_VOTE`).
3. **Audit Trail:** Logs `COMMUNITY_VOTE_CAST` on success; logs `COMMUNITY_VOTE_DUPLICATE_REJECTED` on duplicate attempts with IP, fingerprint, and userId.
4. **Draft Guard:** Prevents voting on draft projects (`422 VOTING_NOT_ALLOWED_ON_DRAFT`).
5. **Event Active Guard:** Voting is only allowed while event status is `ACTIVE`.

**Request Body (`POST /api/votes`):**
```json
{
  "eventId": "uuid-event",
  "submissionId": "uuid-submission",
  "voterFingerprint": "fingerprint_unique_device_hash_128"
}
```

**Response (`201 Created`):**
```json
{
  "message": "Vote recorded successfully.",
  "voteId": "uuid-vote",
  "submissionId": "uuid-submission",
  "voteCount": 43
}
```

### `GET /api/events/:eventId/community/submissions/:submissionId/votes`
Retrieves vote count and checks if the calling user or fingerprint has already voted.

**Response (`200 OK`):**
```json
{
  "submissionId": "uuid-submission",
  "totalVotes": 43,
  "hasVoted": true
}
```

### `POST /api/events/:eventId/community/submissions/:submissionId/comments` & `POST /api/comments`
Posts a comment on a submitted project.

**Authentication:** Required  
**Request Body:**
```json
{
  "content": "Outstanding project! The distributed worker architecture is very well thought out."
}
```
**Response (`201 Created`):** Returns the created comment object.

### `GET /api/events/:eventId/community/submissions/:submissionId/comments`
Lists comments for a submission. Approved comments are public; flagged comments are only visible to organizers.

### `PATCH /api/events/:eventId/community/comments/:commentId/moderate`
Moderates a comment (`APPROVED`, `PENDING`, `FLAGGED`, `REMOVED`). (Organizer only)

---

## 11. Security Audit Trail (`/api/audit`)

### `GET /api/audit`
Queries immutable security audit logs with filtering and pagination.

**Authentication:** Required (Admin or Organizer)  
**Query Parameters:**
- `action` (optional): Filter by action (e.g. `COMMUNITY_VOTE_DUPLICATE_REJECTED`, `FINAL_RESULTS_PUBLISHED`, `USER_UPDATED`).
- `entityType` (optional): `EVENT`, `SUBMISSION`, `TEAM`, `COMMUNITY_VOTE`, `COMMUNITY_COMMENT`, `USER`.
- `entityId` (optional): Specific resource UUID.
- `userId` (optional): Specific actor user ID.
- `page` (optional, default `1`).
- `limit` (optional, default `50`).

**Response (`200 OK`):**
```json
{
  "logs": [
    {
      "id": "uuid",
      "userId": "uuid-actor",
      "action": "COMMUNITY_VOTE_DUPLICATE_REJECTED",
      "entityType": "COMMUNITY_VOTE",
      "entityId": "uuid-submission",
      "oldValue": null,
      "newValue": {
        "reason": "User already voted for this project",
        "voterFingerprint": "fingerprint_1234"
      },
      "ipAddress": "127.0.0.1",
      "timestamp": "2026-09-29T14:30:00.000Z",
      "user": {
        "id": "uuid-actor",
        "name": "Jane Voter",
        "email": "jane@example.com"
      }
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 1, "totalPages": 1 }
}
```
