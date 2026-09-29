import { prisma } from "../../config/database";
import {
  CastVoteInput,
  CreateCommentInput,
  ModerateCommentInput,
  ListCommentsQuery,
} from "./community.schema";
import { auditService } from "../audit/audit.service";
import { CommentStatus, EventRoleType, EventStatus } from "@prisma/client";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class CommunityService {
  private rateLimitMap = new Map<string, RateLimitRecord>();

  /**
   * Helper to check and enforce rate limits.
   */
  private checkRateLimit(key: string, maxRequests: number, windowSeconds: number): void {
    const now = Date.now();
    const record = this.rateLimitMap.get(key);

    if (record && record.resetAt > now) {
      if (record.count >= maxRequests) {
        const error: any = new Error(
          `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowSeconds}s allowed.`
        );
        error.statusCode = 429;
        error.code = "RATE_LIMIT_EXCEEDED";
        throw error;
      }
      record.count += 1;
    } else {
      this.rateLimitMap.set(key, {
        count: 1,
        resetAt: now + windowSeconds * 1000,
      });
    }

    // Clean up expired keys periodically
    if (this.rateLimitMap.size > 10000) {
      for (const [k, rec] of this.rateLimitMap.entries()) {
        if (rec.resetAt <= now) {
          this.rateLimitMap.delete(k);
        }
      }
    }
  }

  /**
   * Clears rate limit map - useful for testing.
   */
  resetRateLimits(): void {
    this.rateLimitMap.clear();
  }

  /**
   * Casts a community vote for a project.
   * Enforces:
   * 1. Rate limiting per IP and fingerprint.
   * 2. Event active status.
   * 3. Non-draft submission status.
   * 4. 1 vote per user or fingerprint per submission.
   * 5. Audit logging on success and on duplicate attempts.
   */
  async castVote(
    eventId: string,
    submissionId: string,
    input: CastVoteInput,
    userId?: string | null,
    ipAddress?: string | null
  ) {
    if (ipAddress) {
      this.checkRateLimit(`vote:ip:${ipAddress}`, 10, 60);
    }
    this.checkRateLimit(`vote:fp:${input.voterFingerprint}`, 10, 60);


    // Verify event
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    if (event.status !== EventStatus.ACTIVE) {
      const error: any = new Error(
        "Community voting is only open during the ACTIVE event phase."
      );
      error.statusCode = 400;
      error.code = "VOTING_WINDOW_CLOSED";
      throw error;
    }

    // Verify submission
    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, eventId },
    });

    if (!submission) {
      const error: any = new Error("Submission not found in this event.");
      error.statusCode = 404;
      error.code = "SUBMISSION_NOT_FOUND";
      throw error;
    }

    if (submission.isDraft) {
      const error: any = new Error(
        "Cannot vote for draft projects. Project must be submitted."
      );
      error.statusCode = 422;
      error.code = "VOTING_NOT_ALLOWED_ON_DRAFT";
      throw error;
    }

    // Duplicate check 1: By voterUserId if logged in
    if (userId) {
      const existingUserVote = await prisma.communityVote.findFirst({
        where: {
          eventId,
          submissionId,
          voterUserId: userId,
        },
      });

      if (existingUserVote) {
        await auditService.log({
          userId,
          action: "COMMUNITY_VOTE_DUPLICATE_REJECTED",
          entityType: "COMMUNITY_VOTE",
          entityId: submissionId,
          newValue: {
            reason: "User already voted for this project",
            voterFingerprint: input.voterFingerprint,
          },
          ipAddress,
        });

        const error: any = new Error("You have already voted for this project.");
        error.statusCode = 409;
        error.code = "DUPLICATE_VOTE";
        throw error;
      }
    }

    // Duplicate check 2: By voterFingerprint
    const existingFingerprintVote = await prisma.communityVote.findUnique({
      where: {
        eventId_voterFingerprint_submissionId: {
          eventId,
          voterFingerprint: input.voterFingerprint,
          submissionId,
        },
      },
    });

    if (existingFingerprintVote) {
      await auditService.log({
        userId: userId || null,
        action: "COMMUNITY_VOTE_DUPLICATE_REJECTED",
        entityType: "COMMUNITY_VOTE",
        entityId: submissionId,
        newValue: {
          reason: "Fingerprint already voted for this project",
          voterFingerprint: input.voterFingerprint,
        },
        ipAddress,
      });

      const error: any = new Error(
        "A vote from this device/browser has already been recorded for this project."
      );
      error.statusCode = 409;
      error.code = "DUPLICATE_VOTE";
      throw error;
    }

    // Record the vote atomically and update vote count if FinalResult exists
    const result = await prisma.$transaction(async (tx) => {
      const vote = await tx.communityVote.create({
        data: {
          eventId,
          submissionId,
          voterUserId: userId || null,
          voterFingerprint: input.voterFingerprint,
          ipAddress: ipAddress || null,
        },
      });

      // Update final result cache if present
      await tx.finalResult.updateMany({
        where: { submissionId },
        data: {
          communityVoteCount: {
            increment: 1,
          },
        },
      });

      const voteCount = await tx.communityVote.count({
        where: { submissionId },
      });

      return { vote, voteCount };
    });

    await auditService.log({
      userId: userId || null,
      action: "COMMUNITY_VOTE_CAST",
      entityType: "COMMUNITY_VOTE",
      entityId: result.vote.id,
      newValue: {
        submissionId,
        voterFingerprint: input.voterFingerprint,
        totalVotes: result.voteCount,
      },
      ipAddress,
    });

    return {
      message: "Vote recorded successfully.",
      voteId: result.vote.id,
      submissionId,
      voteCount: result.voteCount,
    };
  }

  /**
   * Retrieves vote statistics for a submission.
   */
  async getSubmissionVotes(
    eventId: string,
    submissionId: string,
    userId?: string | null,
    voterFingerprint?: string | null
  ) {
    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, eventId },
    });

    if (!submission) {
      const error: any = new Error("Submission not found in this event.");
      error.statusCode = 404;
      error.code = "SUBMISSION_NOT_FOUND";
      throw error;
    }

    const totalVotes = await prisma.communityVote.count({
      where: { submissionId },
    });

    let hasVoted = false;
    if (userId) {
      const userVote = await prisma.communityVote.findFirst({
        where: { submissionId, voterUserId: userId },
      });
      if (userVote) hasVoted = true;
    }

    if (!hasVoted && voterFingerprint) {
      const fpVote = await prisma.communityVote.findUnique({
        where: {
          eventId_voterFingerprint_submissionId: {
            eventId,
            voterFingerprint,
            submissionId,
          },
        },
      });
      if (fpVote) hasVoted = true;
    }

    return {
      submissionId,
      totalVotes,
      hasVoted,
    };
  }

  /**
   * Posts a community comment on a project.
   */
  async createComment(
    eventId: string,
    submissionId: string,
    authorUserId: string,
    input: CreateCommentInput,
    ipAddress?: string | null
  ) {
    this.checkRateLimit(`comment:${authorUserId}`, 15, 60);

    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, eventId },
    });

    if (!submission) {
      const error: any = new Error("Submission not found in this event.");
      error.statusCode = 404;
      error.code = "SUBMISSION_NOT_FOUND";
      throw error;
    }

    if (submission.isDraft) {
      const error: any = new Error(
        "Cannot comment on draft projects. Project must be submitted."
      );
      error.statusCode = 422;
      error.code = "COMMENTING_NOT_ALLOWED_ON_DRAFT";
      throw error;
    }

    const comment = await prisma.communityComment.create({
      data: {
        eventId,
        submissionId,
        authorUserId,
        content: input.content,
        moderationStatus: CommentStatus.APPROVED,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await auditService.log({
      userId: authorUserId,
      action: "COMMUNITY_COMMENT_CREATED",
      entityType: "COMMUNITY_COMMENT",
      entityId: comment.id,
      newValue: { submissionId, contentSnippet: input.content.slice(0, 50) },
      ipAddress,
    });

    return comment;
  }

  /**
   * Retrieves comments for a submission.
   */
  async getComments(
    eventId: string,
    submissionId: string,
    query: Partial<ListCommentsQuery> = {},
    viewerUserId?: string
  ) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    let isOrganizer = false;
    if (viewerUserId) {
      const orgRole = await prisma.eventRole.findFirst({
        where: { eventId, userId: viewerUserId, role: EventRoleType.ORGANIZER },
      });
      const user = await prisma.user.findUnique({ where: { id: viewerUserId } });
      if (orgRole || user?.globalRole === "SUPER_ADMIN") {
        isOrganizer = true;
      }
    }

    const where: any = {
      eventId,
      submissionId,
      ...(!isOrganizer && { moderationStatus: CommentStatus.APPROVED }),
    };

    const [comments, total] = await Promise.all([
      prisma.communityComment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.communityComment.count({ where }),
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Moderates a comment (approve/flag/remove). Organizer or Admin only.
   */
  async moderateComment(
    eventId: string,
    commentId: string,
    input: ModerateCommentInput,
    actorUserId: string,
    ipAddress?: string | null
  ) {
    const comment = await prisma.communityComment.findFirst({
      where: { id: commentId, eventId },
    });

    if (!comment) {
      const error: any = new Error("Comment not found in this event.");
      error.statusCode = 404;
      error.code = "COMMENT_NOT_FOUND";
      throw error;
    }

    const updated = await prisma.communityComment.update({
      where: { id: commentId },
      data: {
        moderationStatus: input.moderationStatus,
      },
    });

    await auditService.log({
      userId: actorUserId,
      action: "COMMUNITY_COMMENT_MODERATED",
      entityType: "COMMUNITY_COMMENT",
      entityId: commentId,
      oldValue: { moderationStatus: comment.moderationStatus },
      newValue: { moderationStatus: updated.moderationStatus },
      ipAddress,
    });

    return updated;
  }
}

export const communityService = new CommunityService();
