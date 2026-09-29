import { apiClient } from "./apiClient";
import { Team } from "../types";

export interface CreateTeamInput {
  name: string;
}

export interface UpdateTeamInput {
  name: string;
}

export interface CreateInviteInput {
  email: string;
}

export const teamService = {
  async createTeam(eventId: string, data: CreateTeamInput): Promise<{ team: Team }> {
    return apiClient.post<{ team: Team }>(`/api/events/${eventId}/teams`, data);
  },

  async getMyTeam(eventId: string): Promise<{ team: Team | null }> {
    return apiClient.get<{ team: Team | null }>(`/api/events/${eventId}/teams/me`);
  },

  async getTeam(eventId: string, teamId: string): Promise<{ team: Team }> {
    return apiClient.get<{ team: Team }>(`/api/events/${eventId}/teams/${teamId}`);
  },

  async updateTeam(eventId: string, teamId: string, data: UpdateTeamInput): Promise<{ team: Team }> {
    return apiClient.patch<{ team: Team }>(`/api/events/${eventId}/teams/${teamId}`, data);
  },

  async createInvite(eventId: string, teamId: string, data: CreateInviteInput): Promise<{ invite: any }> {
    return apiClient.post<{ invite: any }>(`/api/events/${eventId}/teams/${teamId}/invites`, data);
  },

  async acceptInvite(eventId: string, inviteCode: string): Promise<{ message: string; team: Team }> {
    return apiClient.post<{ message: string; team: Team }>(
      `/api/events/${eventId}/team-invites/${inviteCode}/accept`
    );
  },
};
