import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .transform((e) => e.trim().toLowerCase()),
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name must not exceed 120 characters")
    .transform((n) => n.trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must not exceed 128 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .email("Please provide a valid email address")
    .transform((e) => e.trim().toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
