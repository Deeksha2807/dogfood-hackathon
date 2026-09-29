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

export const listTeamsQuerySchema = z.object({
  search: z.string().optional(),
  trackId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListTeamsQuery = z.infer<typeof listTeamsQuerySchema>;

