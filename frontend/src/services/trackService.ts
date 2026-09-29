import { apiClient } from "./apiClient";
import { Track } from "../types";

export interface CreateTrackInput {
  name: string;
  description: string;
  criteria?: string;
}

export interface UpdateTrackInput {
  name?: string;
  description?: string;
  criteria?: string;
}

export const trackService = {
  async listTracks(eventId: string): Promise<{ tracks: Track[] }> {
    return apiClient.get<{ tracks: Track[] }>(`/api/events/${eventId}/tracks`);
  },

  async createTrack(eventId: string, data: CreateTrackInput): Promise<{ track: Track }> {
    return apiClient.post<{ track: Track }>(`/api/events/${eventId}/tracks`, data);
  },

  async updateTrack(eventId: string, trackId: string, data: UpdateTrackInput): Promise<{ track: Track }> {
    return apiClient.patch<{ track: Track }>(`/api/events/${eventId}/tracks/${trackId}`, data);
  },

  async deleteTrack(eventId: string, trackId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/events/${eventId}/tracks/${trackId}`);
  },
};
