import { Router, Request, Response, NextFunction } from "express";
import { requireAuthenticatedUser } from "../../middleware/auth.middleware";
import { prisma } from "../../config/database";

export const eventAccessRouter = Router();

/**
 * GET /api/events/:eventId/access
 * Demonstrates event-scoped authorization verification.
 */
eventAccessRouter.get(
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
