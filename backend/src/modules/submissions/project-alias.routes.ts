import { Router, Request, Response, NextFunction } from "express";
import { submissionService } from "./submission.service";
import { teamService } from "../teams/team.service";
import { optionalAuthenticatedUser } from "../../middleware/auth.middleware";
import { listSubmissionsQuerySchema } from "./submission.schema";
import { prisma } from "../../config/database";

export const projectsRouter = Router();

// GET /api/projects or /api/submissions (List submissions across all events or filtered by eventId)
projectsRouter.get(
  "/",
  optionalAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.query.eventId as string | undefined;

      if (eventId) {
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
        return;
      }

      // If no eventId specified, list from the latest active event
      const activeEvent = await prisma.event.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      });

      if (!activeEvent) {
        res.status(200).json({ submissions: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } });
        return;
      }

      const parsed = listSubmissionsQuerySchema.safeParse(req.query);
      const queryData = parsed.success ? parsed.data : {};
      const result = await submissionService.listSubmissions(
        activeEvent.id,
        queryData,
        req.user?.id
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/projects/:submissionId
projectsRouter.get(
  "/:submissionId",
  optionalAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const submissionId = req.params.submissionId as string;
      const submission = await submissionService.getSubmissionById(submissionId);
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

export const teamsAliasRouter = Router();

// GET /api/teams/:teamId
teamsAliasRouter.get(
  "/:teamId",
  optionalAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const teamId = req.params.teamId as string;
      const team = await teamService.getTeamById(teamId);
      res.status(200).json({ team });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "TEAM_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);
