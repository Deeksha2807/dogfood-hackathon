import { z } from "zod";

export const createSubmissionSchema = z.object({
  teamId: z.string().uuid("Invalid team ID format"),
  trackId: z.string().uuid("Invalid track ID format"),
  projectName: z.string().min(1, "Project name is required").max(255),
  tagline: z.string().max(300).optional(),
  description: z.string().min(1, "Description is required"),
  repoUrl: z.string().url("Invalid repository URL").max(500).optional().or(z.literal("")),
  demoUrl: z.string().url("Invalid demo URL").max(500).optional().or(z.literal("")),
  videoUrl: z.string().url("Invalid video URL").max(500).optional().or(z.literal("")),
  isDraft: z.boolean().optional().default(true),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;

export const updateSubmissionSchema = z.object({
  projectName: z.string().min(1).max(255).optional(),
  tagline: z.string().max(300).optional(),
  description: z.string().min(1).optional(),
  repoUrl: z.string().url().max(500).optional().or(z.literal("")),
  demoUrl: z.string().url().max(500).optional().or(z.literal("")),
  videoUrl: z.string().url().max(500).optional().or(z.literal("")),
  trackId: z.string().uuid().optional(),
});

export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;

export const listSubmissionsQuerySchema = z.object({
  trackId: z.string().uuid().optional(),
  search: z.string().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "UNDER_REVIEW", "EVALUATED"]).optional(),
  isDraft: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  shuffle: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListSubmissionsQuery = z.infer<typeof listSubmissionsQuerySchema>;

