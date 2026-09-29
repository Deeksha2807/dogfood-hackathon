import { apiClient } from "./apiClient";
import { Prize } from "../types";

export interface CreatePrizeInput {
  name: string;
  description?: string;
  amount: number;
  rank?: number;
}

export interface UpdatePrizeInput {
  name?: string;
  description?: string;
  amount?: number;
  rank?: number;
}

export const prizeService = {
  async listPrizes(eventId: string): Promise<{ prizes: Prize[] }> {
    return apiClient.get<{ prizes: Prize[] }>(`/api/events/${eventId}/prizes`);
  },

  async createPrize(eventId: string, data: CreatePrizeInput): Promise<{ prize: Prize }> {
    return apiClient.post<{ prize: Prize }>(`/api/events/${eventId}/prizes`, data);
  },

  async updatePrize(eventId: string, prizeId: string, data: UpdatePrizeInput): Promise<{ prize: Prize }> {
    return apiClient.patch<{ prize: Prize }>(`/api/events/${eventId}/prizes/${prizeId}`, data);
  },

  async deletePrize(eventId: string, prizeId: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/events/${eventId}/prizes/${prizeId}`);
  },
};
