import { Router, Request, Response, NextFunction } from "express";
import { eventService } from "./event.service";
import { createEventSchema, updateEventSchema, listEventsQuerySchema } from "./event.schema";
import { requireAuthenticatedUser } from "../../middleware/auth.middleware";
import { requireEventOrganizer } from "../../middleware/rbac.middleware";
import { prisma } from "../../config/database";

import { trackRouter } from "../tracks/track.routes";
import { prizeRouter } from "../prizes/prize.routes";
import { teamRouter, teamInviteRouter } from "../teams/team.routes";
import { submissionRouter } from "../submissions/submission.routes";
import { judgeRouter, rubricRouter, judgingRouter } from "../judging/judging.routes";
import { communityRouter } from "../community/community.routes";
import { auditRouter } from "../audit/audit.routes";

export const eventRouter = Router();


// GET /api/events (List Events with pagination and filtering)
eventRouter.get(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = listEventsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid query parameters.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await eventService.listEvents(parsed.data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/events (Create Event - established creator as ORGANIZER)
eventRouter.post(
  "/",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createEventSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid event data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const event = await eventService.createEvent(req.user!.id, parsed.data, req.ip);
      res.status(201).json({ event });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "EVENT_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);


// GET /api/events/:eventId (Get Event Details)
eventRouter.get(
  "/:eventId",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const event = await eventService.getEventById(eventId);
      res.status(200).json({ event });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "EVENT_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// PATCH /api/events/:eventId (Update Event - Organizer only)
eventRouter.patch(
  "/:eventId",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const parsed = updateEventSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid event update data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const event = await eventService.updateEvent(eventId, parsed.data, req.user!.id, req.ip);
      res.status(200).json({ event });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "EVENT_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// GET /api/events/:eventId/access (Preserved Phase 3 verification route)
eventRouter.get(
  "/:eventId/access",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;

      const eventRole = await prisma.eventRole.findFirst({
        where: {
          eventId,
          userId: req.user!.id,
        },
      });

      if (!eventRole) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "Access denied: You do not hold any role in this event.",
        });
        return;
      }

      res.status(200).json({
        eventId: eventRole.eventId,
        userId: req.user!.id,
        role: eventRole.role,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Mount nested sub-routers
eventRouter.use("/:eventId/tracks", trackRouter);
eventRouter.use("/:eventId/prizes", prizeRouter);
eventRouter.use("/:eventId/teams", teamRouter);
eventRouter.use("/:eventId/team-invites", teamInviteRouter);
eventRouter.use("/:eventId/submissions", submissionRouter);
eventRouter.use("/:eventId/judges", judgeRouter);
eventRouter.use("/:eventId/rubrics", rubricRouter);
eventRouter.use("/:eventId/judging", judgingRouter);
eventRouter.use("/:eventId/community", communityRouter);
eventRouter.use("/:eventId/audit", auditRouter);


