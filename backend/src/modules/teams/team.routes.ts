import { Router, Request, Response, NextFunction } from "express";
import { teamService } from "./team.service";
import { createTeamSchema, updateTeamSchema, createInviteSchema, listTeamsQuerySchema } from "./team.schema";
import { requireAuthenticatedUser } from "../../middleware/auth.middleware";

export const teamRouter = Router({ mergeParams: true });
export const teamInviteRouter = Router({ mergeParams: true });

// GET /api/events/:eventId/teams
teamRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const parsed = listTeamsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid query parameters.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await teamService.listTeams(eventId, parsed.data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/events/:eventId/teams

teamRouter.post(
  "/",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const parsed = createTeamSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid team data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const team = await teamService.createTeam(eventId, req.user!.id, parsed.data);
      res.status(201).json({ team });
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

// GET /api/events/:eventId/teams/:teamId
teamRouter.get(
  "/:teamId",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const teamId = req.params.teamId as string;
      const team = await teamService.getTeam(eventId, teamId);
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

// PATCH /api/events/:eventId/teams/:teamId
teamRouter.patch(
  "/:teamId",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const teamId = req.params.teamId as string;
      const parsed = updateTeamSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid team update data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const team = await teamService.updateTeam(eventId, teamId, req.user!.id, parsed.data);
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

// POST /api/events/:eventId/teams/:teamId/leave
teamRouter.post(
  "/:teamId/leave",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const teamId = req.params.teamId as string;
      const result = await teamService.leaveTeam(eventId, teamId, req.user!.id, req.ip);
      res.status(200).json(result);
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

// POST /api/events/:eventId/teams/:teamId/invites

teamRouter.post(
  "/:teamId/invites",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const teamId = req.params.teamId as string;
      const parsed = createInviteSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid invite data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const invite = await teamService.createInvite(eventId, teamId, req.user!.id, parsed.data);
      res.status(201).json({ invite });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "INVITE_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// POST /api/events/:eventId/team-invites/:inviteCode/accept
teamInviteRouter.post(
  "/:inviteCode/accept",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const inviteCode = req.params.inviteCode as string;
      const result = await teamService.acceptInvite(eventId, inviteCode, {
        id: req.user!.id,
        email: req.user!.email,
      });
      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "INVITE_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);
