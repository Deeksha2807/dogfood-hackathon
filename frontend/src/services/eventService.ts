import { apiClient } from "./apiClient";
import { Event, EventStatus } from "../types";

export interface CreateEventInput {
  name: string;
  description: string;
  status: EventStatus;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  judgingDeadline: string;
  maxTeamSize: number;
}

export interface UpdateEventInput {
  name?: string;
  description?: string;
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
  submissionDeadline?: string;
  judgingDeadline?: string;
  maxTeamSize?: number;
  resultsPublished?: boolean;
}

export const eventService = {
  async getEventById(eventId: string): Promise<{ event: Event }> {
    return apiClient.get<{ event: Event }>(`/api/events/${eventId}`);
  },

  async createEvent(data: CreateEventInput): Promise<{ event: Event }> {
    return apiClient.post<{ event: Event }>("/api/events", data);
  },

  async updateEvent(eventId: string, data: UpdateEventInput): Promise<{ event: Event }> {
    return apiClient.patch<{ event: Event }>(`/api/events/${eventId}`, data);
  },

  async getEventAccess(eventId: string): Promise<{ eventId: string; userId: string; role: string }> {
    return apiClient.get<{ eventId: string; userId: string; role: string }>(`/api/events/${eventId}/access`);
  },
};
