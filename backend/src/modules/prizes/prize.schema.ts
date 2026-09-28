import { z } from "zod";

export const createPrizeSchema = z.object({
  name: z.string().min(1, "Prize name is required").max(150),
  description: z.string().optional(),
  cashValue: z.number().min(0, "Cash value cannot be negative").optional().default(0),
  trackId: z.string().uuid("Invalid track ID format").optional(),
});

export type CreatePrizeInput = z.infer<typeof createPrizeSchema>;

export const updatePrizeSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().optional(),
  cashValue: z.number().min(0).optional(),
  trackId: z.string().uuid().nullable().optional(),
});

export type UpdatePrizeInput = z.infer<typeof updatePrizeSchema>;
