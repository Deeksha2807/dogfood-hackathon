import { Router, Request, Response, NextFunction } from "express";
import { submissionService } from "./submission.service";
import {
  createSubmissionSchema,
  updateSubmissionSchema,
  listSubmissionsQuerySchema,
} from "./submission.schema";
import {
  requireAuthenticatedUser,
  optionalAuthenticatedUser,
} from "../../middleware/auth.middleware";

export const submissionRouter = Router({ mergeParams: true });

// GET /api/events/:eventId/submissions (Project gallery / submission list)
submissionRouter.get(
  "/",
  optionalAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const parsed = listSubmissionsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid query parameters.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await submissionService.listSubmissions(
        eventId,
        parsed.data,
        req.user?.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/events/:eventId/submissions

submissionRouter.post(
  "/",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const parsed = createSubmissionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid submission data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const submission = await submissionService.createSubmission(
        eventId,
        req.user!.id,
        parsed.data
      );
      res.status(201).json({ submission });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "SUBMISSION_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// GET /api/events/:eventId/submissions/:submissionId
submissionRouter.get(
  "/:submissionId",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const submissionId = req.params.submissionId as string;
      const submission = await submissionService.getSubmission(eventId, submissionId);
      res.status(200).json({ submission });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "SUBMISSION_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// PATCH /api/events/:eventId/submissions/:submissionId
submissionRouter.patch(
  "/:submissionId",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const submissionId = req.params.submissionId as string;
      const parsed = updateSubmissionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid submission update data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const submission = await submissionService.updateSubmission(
        eventId,
        submissionId,
        req.user!.id,
        parsed.data
      );
      res.status(200).json({ submission });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "SUBMISSION_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// POST /api/events/:eventId/submissions/:submissionId/finalize
submissionRouter.post(
  "/:submissionId/finalize",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const submissionId = req.params.submissionId as string;
      const submission = await submissionService.finalizeSubmission(
        eventId,
        submissionId,
        req.user!.id
      );
      res.status(200).json({
        message: "Submission finalized successfully.",
        submission,
      });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "SUBMISSION_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);
