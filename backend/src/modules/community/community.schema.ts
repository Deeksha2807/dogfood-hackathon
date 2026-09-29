import { z } from "zod";
import { CommentStatus } from "@prisma/client";

export const castVoteSchema = z.object({
  voterFingerprint: z
    .string()
    .min(8, "Voter fingerprint must be at least 8 characters")
    .max(128, "Voter fingerprint must not exceed 128 characters"),
});

export type CastVoteInput = z.infer<typeof castVoteSchema>;

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment content cannot be empty")
    .max(2000, "Comment content cannot exceed 2000 characters"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const moderateCommentSchema = z.object({
  moderationStatus: z.nativeEnum(CommentStatus),
});

export type ModerateCommentInput = z.infer<typeof moderateCommentSchema>;

export const listCommentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;
