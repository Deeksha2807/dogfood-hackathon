import { apiClient } from "./apiClient";
import { Submission } from "../types";

export interface CreateSubmissionInput {
  teamId: string;
  trackId: string;
  projectName: string;
  tagline: string;
  description: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
  isDraft?: boolean;
}

export interface UpdateSubmissionInput {
  trackId?: string;
  projectName?: string;
  tagline?: string;
  description?: string;
  repoUrl?: string;
  demoUrl?: string;
  videoUrl?: string;
}

export const submissionService = {
  async createSubmission(eventId: string, data: CreateSubmissionInput): Promise<{ submission: Submission }> {
    return apiClient.post<{ submission: Submission }>(`/api/events/${eventId}/submissions`, data);
  },

  async getMySubmission(eventId: string): Promise<{ submission: Submission | null; team?: any }> {
    return apiClient.get<{ submission: Submission | null; team?: any }>(`/api/events/${eventId}/submissions/me`);
  },

  async getSubmissions(eventId: string): Promise<{ submissions: Submission[] }> {
    return apiClient.get<{ submissions: Submission[] }>(`/api/events/${eventId}/submissions`);
  },

  async getSubmission(eventId: string, submissionId: string): Promise<{ submission: Submission }> {
    return apiClient.get<{ submission: Submission }>(`/api/events/${eventId}/submissions/${submissionId}`);
  },

  async updateSubmission(
    eventId: string,
    submissionId: string,
    data: UpdateSubmissionInput
  ): Promise<{ submission: Submission }> {
    return apiClient.patch<{ submission: Submission }>(
      `/api/events/${eventId}/submissions/${submissionId}`,
      data
    );
  },

  async finalizeSubmission(
    eventId: string,
    submissionId: string
  ): Promise<{ message: string; submission: Submission }> {
    return apiClient.post<{ message: string; submission: Submission }>(
      `/api/events/${eventId}/submissions/${submissionId}/finalize`
    );
  },
};
