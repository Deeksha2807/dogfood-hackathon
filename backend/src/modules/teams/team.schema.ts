import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1, "Team name is required").max(150),
  trackId: z.string().uuid("Invalid track ID").optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  trackId: z.string().uuid().nullable().optional(),
});

export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

export const createInviteSchema = z.object({
  targetEmail: z
    .string()
    .email("Invalid email format")
    .transform((e) => e.trim().toLowerCase())
    .optional(),
  maxUses: z.number().int().min(1).max(50).optional().default(5),
  expiresInHours: z.number().int().min(1).max(720).optional().default(72),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
