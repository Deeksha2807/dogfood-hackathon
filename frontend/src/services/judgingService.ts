import { apiClient } from "./apiClient";
import {
  JudgeInvitation,
  JudgeAssignment,
  Rubric,
  RubricCriterion,
  Evaluation,
  JudgeProgress,
  OverallJudgingProgress,
  FinalResult,
} from "../types";

export interface CreateJudgeInvitationInput {
  email: string;
}

export interface CreateAssignmentInput {
  judgeId: string;
  submissionId: string;
}

export interface BatchAssignmentInput {
  judgesPerSubmission?: number;
}

export interface CreateRubricInput {
  name: string;
  description?: string;
  minScore?: number;
  maxScore?: number;
}

export interface CreateCriterionInput {
  name: string;
  description?: string;
  weight: number;
  maxScore?: number;
}

export interface SubmitEvaluationInput {
  scores: { criterionId: string; score: number }[];
  feedback?: string;
  isDraft?: boolean;
}

export const judgingService = {
  // Judge Invitations (Organizer)
  async getInvitations(eventId: string): Promise<{ invitations: JudgeInvitation[] }> {
    return apiClient.get<{ invitations: JudgeInvitation[] }>(`/api/events/${eventId}/judges/invitations`);
  },

  async createInvitation(eventId: string, data: CreateJudgeInvitationInput): Promise<{ invitation: JudgeInvitation }> {
    return apiClient.post<{ invitation: JudgeInvitation }>(`/api/events/${eventId}/judges/invitations`, data);
  },

  async acceptInvitation(eventId: string, invitationId: string): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(`/api/events/${eventId}/judges/invitations/${invitationId}/accept`);
  },

  async revokeInvitation(eventId: string, invitationId: string): Promise<{ invitation: JudgeInvitation }> {
    return apiClient.post<{ invitation: JudgeInvitation }>(
      `/api/events/${eventId}/judges/invitations/${invitationId}/revoke`
    );
  },

  // Judge Assignments (Organizer)
  async getAssignments(
    eventId: string,
    params?: { judgeId?: string; submissionId?: string }
  ): Promise<{ assignments: JudgeAssignment[] }> {
    const query = new URLSearchParams();
    if (params?.judgeId) query.set("judgeId", params.judgeId);
    if (params?.submissionId) query.set("submissionId", params.submissionId);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return apiClient.get<{ assignments: JudgeAssignment[] }>(`/api/events/${eventId}/judges/assignments${qs}`);
  },

  async createAssignment(eventId: string, data: CreateAssignmentInput): Promise<{ assignment: JudgeAssignment }> {
    return apiClient.post<{ assignment: JudgeAssignment }>(`/api/events/${eventId}/judges/assignments`, data);
  },

  async createBatchAssignments(
    eventId: string,
    data: BatchAssignmentInput
  ): Promise<{ message: string; count: number }> {
    return apiClient.post<{ message: string; count: number }>(
      `/api/events/${eventId}/judges/assignments/batch`,
      data
    );
  },

  // Rubrics (Organizer & Public read)
  async getRubric(eventId: string): Promise<{ rubric: Rubric | null }> {
    return apiClient.get<{ rubric: Rubric | null }>(`/api/events/${eventId}/rubrics`);
  },

  async createRubric(eventId: string, data: CreateRubricInput): Promise<{ rubric: Rubric }> {
    return apiClient.post<{ rubric: Rubric }>(`/api/events/${eventId}/rubrics`, data);
  },

  async updateRubric(eventId: string, rubricId: string, data: Partial<CreateRubricInput>): Promise<{ rubric: Rubric }> {
    return apiClient.patch<{ rubric: Rubric }>(`/api/events/${eventId}/rubrics/${rubricId}`, data);
  },

  async addCriterion(
    eventId: string,
    rubricId: string,
    data: CreateCriterionInput
  ): Promise<{ criterion: RubricCriterion }> {
    return apiClient.post<{ criterion: RubricCriterion }>(
      `/api/events/${eventId}/rubrics/${rubricId}/criteria`,
      data
    );
  },

  async updateCriterion(
    eventId: string,
    rubricId: string,
    criterionId: string,
    data: Partial<CreateCriterionInput>
  ): Promise<{ criterion: RubricCriterion }> {
    return apiClient.patch<{ criterion: RubricCriterion }>(
      `/api/events/${eventId}/rubrics/${rubricId}/criteria/${criterionId}`,
      data
    );
  },

  // Judge Operations (Judge role)
  async getMyAssignments(eventId: string): Promise<{ assignments: JudgeAssignment[] }> {
    return apiClient.get<{ assignments: JudgeAssignment[] }>(`/api/events/${eventId}/judging/assignments`);
  },

  async getMyAssignmentById(
    eventId: string,
    assignmentId: string
  ): Promise<{ assignment: JudgeAssignment; rubric: Rubric; existingEvaluation?: Evaluation | null }> {
    return apiClient.get<{ assignment: JudgeAssignment; rubric: Rubric; existingEvaluation?: Evaluation | null }>(
      `/api/events/${eventId}/judging/assignments/${assignmentId}`
    );
  },

  async submitEvaluation(
    eventId: string,
    assignmentId: string,
    data: SubmitEvaluationInput
  ): Promise<{ evaluation: Evaluation }> {
    return apiClient.post<{ evaluation: Evaluation }>(
      `/api/events/${eventId}/judging/assignments/${assignmentId}/evaluation`,
      data
    );
  },

  async updateEvaluation(
    eventId: string,
    evaluationId: string,
    data: SubmitEvaluationInput
  ): Promise<{ evaluation: Evaluation }> {
    return apiClient.patch<{ evaluation: Evaluation }>(
      `/api/events/${eventId}/judging/evaluations/${evaluationId}`,
      data
    );
  },

  async getJudgeProgress(eventId: string): Promise<{ progress: JudgeProgress }> {
    return apiClient.get<{ progress: JudgeProgress }>(`/api/events/${eventId}/judging/my-progress`);
  },

  async getOverallProgress(eventId: string): Promise<{ progress: OverallJudgingProgress }> {
    return apiClient.get<{ progress: OverallJudgingProgress }>(`/api/events/${eventId}/judging/progress`);
  },

  // Final Results & Normalization (Organizer / Public)
  async calculateFinalResults(eventId: string): Promise<{ results: FinalResult[] }> {
    return apiClient.post<{ results: FinalResult[] }>(`/api/events/${eventId}/judging/final-results/calculate`);
  },

  async publishFinalResults(eventId: string): Promise<{ message: string; resultsPublished: boolean }> {
    return apiClient.post<{ message: string; resultsPublished: boolean }>(
      `/api/events/${eventId}/judging/final-results/publish`
    );
  },

  async getFinalResults(eventId: string): Promise<{ results: FinalResult[] }> {
    return apiClient.get<{ results: FinalResult[] }>(`/api/events/${eventId}/judging/final-results`);
  },

  async exportResultsCsv(eventId: string): Promise<string> {
    return apiClient.get<string>(`/api/events/${eventId}/judging/results.csv`);
  },
};
