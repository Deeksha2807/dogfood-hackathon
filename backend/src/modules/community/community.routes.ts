import { Router, Request, Response, NextFunction } from "express";
import { communityService } from "./community.service";
import {
  castVoteSchema,
  createCommentSchema,
  moderateCommentSchema,
  listCommentsQuerySchema,
} from "./community.schema";
import {
  requireAuthenticatedUser,
  optionalAuthenticatedUser,
} from "../../middleware/auth.middleware";
import { requireEventOrganizer } from "../../middleware/rbac.middleware";

// Event-nested sub-router: mounted at /api/events/:eventId/community
export const communityRouter = Router({ mergeParams: true });

// POST /api/events/:eventId/community/submissions/:submissionId/vote
communityRouter.post(
  "/submissions/:submissionId/vote",
  optionalAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const submissionId = req.params.submissionId as string;
      const parsed = castVoteSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid vote data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await communityService.castVote(
        eventId,
        submissionId,
        parsed.data,
        req.user?.id || null,
        req.ip
      );
      res.status(201).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "VOTE_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// GET /api/events/:eventId/community/submissions/:submissionId/votes
communityRouter.get(
  "/submissions/:submissionId/votes",
  optionalAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const submissionId = req.params.submissionId as string;
      const fingerprint = typeof req.query.fingerprint === "string" ? req.query.fingerprint : null;

      const result = await communityService.getSubmissionVotes(
        eventId,
        submissionId,
        req.user?.id || null,
        fingerprint
      );
      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "VOTE_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// POST /api/events/:eventId/community/submissions/:submissionId/comments
communityRouter.post(
  "/submissions/:submissionId/comments",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const submissionId = req.params.submissionId as string;
      const parsed = createCommentSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid comment data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const comment = await communityService.createComment(
        eventId,
        submissionId,
        req.user!.id,
        parsed.data,
        req.ip
      );
      res.status(201).json({ comment });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "COMMENT_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// GET /api/events/:eventId/community/submissions/:submissionId/comments
communityRouter.get(
  "/submissions/:submissionId/comments",
  optionalAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const submissionId = req.params.submissionId as string;
      const parsed = listCommentsQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid query parameters.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await communityService.getComments(
        eventId,
        submissionId,
        parsed.data,
        req.user?.id
      );
      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "COMMENT_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// PATCH /api/events/:eventId/community/comments/:commentId/moderate
communityRouter.patch(
  "/comments/:commentId/moderate",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const commentId = req.params.commentId as string;
      const parsed = moderateCommentSchema.safeParse(req.body);

      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid moderation status.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const comment = await communityService.moderateComment(
        eventId,
        commentId,
        parsed.data,
        req.user!.id,
        req.ip
      );
      res.status(200).json({ comment });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "COMMENT_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// Top-level routers for /api/votes and /api/comments
export const votesRouter = Router();

// POST /api/votes
votesRouter.post(
  "/",
  optionalAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId, submissionId, voterFingerprint } = req.body;
      if (!eventId || !submissionId || !voterFingerprint) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "eventId, submissionId, and voterFingerprint are required.",
        });
        return;
      }

      const parsed = castVoteSchema.safeParse({ voterFingerprint });
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid vote data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await communityService.castVote(
        eventId,
        submissionId,
        parsed.data,
        req.user?.id || null,
        req.ip
      );
      res.status(201).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "VOTE_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

export const commentsRouter = Router();

// POST /api/comments
commentsRouter.post(
  "/",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { eventId, submissionId, content } = req.body;
      if (!eventId || !submissionId || !content) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "eventId, submissionId, and content are required.",
        });
        return;
      }

      const parsed = createCommentSchema.safeParse({ content });
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid comment data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const comment = await communityService.createComment(
        eventId,
        submissionId,
        req.user!.id,
        parsed.data,
        req.ip
      );
      res.status(201).json({ comment });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "COMMENT_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);
