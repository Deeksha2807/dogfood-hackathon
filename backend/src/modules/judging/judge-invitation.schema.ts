import { z } from "zod";

export const createJudgeInvitationSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .transform((e) => e.trim().toLowerCase()),
  expiresInHours: z.number().int().min(1).max(720).optional().default(168),
});

export type CreateJudgeInvitationInput = z.infer<typeof createJudgeInvitationSchema>;
