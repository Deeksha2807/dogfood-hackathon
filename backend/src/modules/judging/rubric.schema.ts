import { z } from "zod";

export const createCriterionSchema = z.object({
  name: z.string().min(1, "Criterion name is required").max(100),
  description: z.string().max(1000).optional(),
  weightBasisPoints: z
    .number()
    .int("Weight must be an integer (basis points)")
    .min(1, "Weight must be positive")
    .max(10000, "Weight cannot exceed 10000 basis points"),
  maxPoints: z
    .number()
    .min(0.01, "Max points must be greater than zero")
    .max(100, "Max points cannot exceed 100"),
  orderIndex: z.number().int().min(0).optional(),
});

export type CreateCriterionInput = z.infer<typeof createCriterionSchema>;

export const updateCriterionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  weightBasisPoints: z
    .number()
    .int("Weight must be an integer (basis points)")
    .min(1)
    .max(10000)
    .optional(),
  maxPoints: z.number().min(0.01).max(100).optional(),
  orderIndex: z.number().int().min(0).optional(),
});

export type UpdateCriterionInput = z.infer<typeof updateCriterionSchema>;

export const createRubricSchema = z.object({
  name: z.string().min(1, "Rubric name is required").max(120),
  criteria: z.array(createCriterionSchema).optional(),
});

export type CreateRubricInput = z.infer<typeof createRubricSchema>;

export const updateRubricSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  isLocked: z.boolean().optional(),
});

export type UpdateRubricInput = z.infer<typeof updateRubricSchema>;
