import { z } from "zod";

export const createAssignmentSchema = z.object({
  judgeId: z.string().uuid("Invalid judge user ID"),
  submissionId: z.string().uuid("Invalid submission ID"),
});

export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;

export const batchAssignmentSchema = z.object({
  judgeIds: z.array(z.string().uuid()).min(1).optional(),
  submissionIds: z.array(z.string().uuid()).min(1).optional(),
  judgesPerSubmission: z.number().int().min(1).max(20).optional().default(2),
});

export type BatchAssignmentInput = z.infer<typeof batchAssignmentSchema>;
