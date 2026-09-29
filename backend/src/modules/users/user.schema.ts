import { z } from "zod";
import { GlobalRole } from "@prisma/client";

export const listUsersQuerySchema = z.object({
  search: z.string().optional(),
  globalRole: z.nativeEnum(GlobalRole).optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  isActive: z.boolean().optional(),
  globalRole: z.nativeEnum(GlobalRole).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
