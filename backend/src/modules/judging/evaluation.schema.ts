import { z } from "zod";

export const criterionScoreItemSchema = z.object({
  criterionId: z.string().uuid("Invalid criterion ID"),
  score: z.number().min(0, "Score cannot be negative"),
  comment: z.string().max(500).optional(),
});

export const createEvaluationSchema = z.object({
  scores: z
    .array(criterionScoreItemSchema)
    .min(1, "At least one criterion score is required"),
  feedback: z.string().max(3000).optional(),
  isDraft: z.boolean().optional().default(false),
});

export type CreateEvaluationInput = z.infer<typeof createEvaluationSchema>;

export const updateEvaluationSchema = z.object({
  scores: z.array(criterionScoreItemSchema).min(1).optional(),
  feedback: z.string().max(3000).optional(),
  isDraft: z.boolean().optional(),
});

export type UpdateEvaluationInput = z.infer<typeof updateEvaluationSchema>;
