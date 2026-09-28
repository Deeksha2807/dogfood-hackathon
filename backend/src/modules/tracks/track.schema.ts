import { z } from "zod";

export const createTrackSchema = z.object({
  name: z.string().min(1, "Track name is required").max(100),
  description: z.string().optional(),
});

export type CreateTrackInput = z.infer<typeof createTrackSchema>;

export const updateTrackSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
});

export type UpdateTrackInput = z.infer<typeof updateTrackSchema>;
