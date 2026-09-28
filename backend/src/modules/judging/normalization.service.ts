export interface RawJudgeEvaluation {
  id: string;
  judgeId: string;
  submissionId: string;
  rawTotalScore: number;
}

export interface NormalizedEvaluationResult {
  evaluationId: string;
  judgeId: string;
  submissionId: string;
  rawTotalScore: number;
  normalizedScore: number;
}

export interface SubmissionScoreAggregate {
  submissionId: string;
  evaluationsCount: number;
  rawAverageScore: number;
  normalizedScore: number;
}

/**
 * Cross-Judge Score Normalization Service
 *
 * NOTE ON SPECIFICATION STATUS:
 * - The hackathon requirements mandate cross-judge score normalization.
 * - However, the official hackathon specification DOES NOT specify an exact normalization formula.
 * - Therefore, the formula below (Z-Score mapping to Target Mean = 75.0, Std = 15.0 with mean-shift fallback)
 *   is an IMPLEMENTATION CHOICE designed for fairness and numerical stability, NOT an official specification rule.
 *
 * DESIGN & INTEGRITY GUARANTEES:
 * 1. Immutability: Raw scores in the database are NEVER mutated by normalization.
 * 2. Determinism: Normalization is completely deterministic and reproducible.
 * 3. Division-by-Zero Safety: Handles zero-variance (constant score) and single-evaluation cases safely.
 * 4. Missing Evaluation Safety: Missing evaluations are omitted from the average, never padded with 0.
 * 5. Scale Invariance: Normalizes scores into a consistent 0–100 scale.
 *
 * Mathematical Definition (Implementation Choice):
 * 1. For each judge j with evaluations S_j:
 *    - Judge Mean:      mu_j    = (1 / |S_j|) * sum_{s in S_j} R_{j,s}
 *    - Judge Std Dev:   sigma_j = sqrt( (1 / |S_j|) * sum_{s in S_j} (R_{j,s} - mu_j)^2 )
 *
 * 2. Target Distribution:
 *    - Target Mean:     T_mu    = 75.0
 *    - Target Std Dev:  T_sigma = 15.0
 *
 * 3. Individual Evaluation Normalization:
 *    - If sigma_j > 1e-4:
 *        Z_{j,s}     = (R_{j,s} - mu_j) / sigma_j
 *        Norm_{j,s}  = clamp(T_mu + T_sigma * Z_{j,s}, 0, 100)
 *    - If sigma_j <= 1e-4 (zero-variance / single evaluation):
 *        Norm_{j,s}  = clamp(R_{j,s} - mu_j + T_mu, 0, 100)
 *
 * 4. Aggregation:
 *    For each submission s with completed evaluations E_s:
 *    - rawAverageScore(s) = (1 / |E_s|) * sum_{e in E_s} e.rawTotalScore
 *    - normalizedScore(s) = (1 / |E_s|) * sum_{e in E_s} e.normalizedScore
 */
export class NormalizationService {
  /**
   * Target mean and standard deviation for the normalized scale.
   * Defined as an implementation choice.
   */
  public readonly TARGET_MEAN = 75.0;
  public readonly TARGET_STD = 15.0;
  public readonly EPSILON = 1e-4;

  /**
   * Computes normalized scores for all evaluations and aggregated submission scores.
   * Does NOT mutate the input evaluations.
   */
  normalizeEvaluations(evaluations: RawJudgeEvaluation[]): {
    normalizedEvaluations: NormalizedEvaluationResult[];
    submissionAggregates: Map<string, SubmissionScoreAggregate>;
  } {
    if (evaluations.length === 0) {
      return {
        normalizedEvaluations: [],
        submissionAggregates: new Map(),
      };
    }

    // 1. Group evaluations by judge
    const judgeMap = new Map<string, RawJudgeEvaluation[]>();
    for (const ev of evaluations) {
      const list = judgeMap.get(ev.judgeId) || [];
      list.push(ev);
      judgeMap.set(ev.judgeId, list);
    }

    // 2. Compute mean (mu) and standard deviation (sigma) for each judge
    const judgeStats = new Map<string, { mean: number; std: number }>();
    for (const [judgeId, evList] of judgeMap.entries()) {
      const scores = evList.map((e) => e.rawTotalScore);
      const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      const variance =
        scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
      const std = Math.sqrt(variance);

      judgeStats.set(judgeId, { mean, std });
    }

    // 3. Compute normalized score for each evaluation
    const normalizedEvaluations: NormalizedEvaluationResult[] = [];
    const submissionMap = new Map<string, { rawScores: number[]; normScores: number[] }>();

    for (const ev of evaluations) {
      const stats = judgeStats.get(ev.judgeId)!;
      let normScore: number;

      if (stats.std > this.EPSILON) {
        // Standard Z-Score mapping to target distribution (Implementation Choice)
        const zScore = (ev.rawTotalScore - stats.mean) / stats.std;
        normScore = this.TARGET_MEAN + this.TARGET_STD * zScore;
      } else {
        // Zero variance (all scores identical) or single evaluation:
        // Fallback to mean-shift preserving the judge's score relative to the target mean
        normScore = ev.rawTotalScore - stats.mean + this.TARGET_MEAN;
      }

      // Clamp to valid [0, 100] range
      normScore = Math.max(0, Math.min(100, Math.round(normScore * 10000) / 10000));

      normalizedEvaluations.push({
        evaluationId: ev.id,
        judgeId: ev.judgeId,
        submissionId: ev.submissionId,
        rawTotalScore: ev.rawTotalScore,
        normalizedScore: normScore,
      });

      // Group by submission for aggregation
      const subEntry = submissionMap.get(ev.submissionId) || {
        rawScores: [],
        normScores: [],
      };
      subEntry.rawScores.push(ev.rawTotalScore);
      subEntry.normScores.push(normScore);
      submissionMap.set(ev.submissionId, subEntry);
    }

    // 4. Compute submission aggregates
    const submissionAggregates = new Map<string, SubmissionScoreAggregate>();
    for (const [submissionId, data] of submissionMap.entries()) {
      const count = data.rawScores.length;
      const rawAvg =
        Math.round((data.rawScores.reduce((a, b) => a + b, 0) / count) * 10000) / 10000;
      const normAvg =
        Math.round((data.normScores.reduce((a, b) => a + b, 0) / count) * 10000) / 10000;

      submissionAggregates.set(submissionId, {
        submissionId,
        evaluationsCount: count,
        rawAverageScore: rawAvg,
        normalizedScore: normAvg,
      });
    }

    return {
      normalizedEvaluations,
      submissionAggregates,
    };
  }
}

export const normalizationService = new NormalizationService();
