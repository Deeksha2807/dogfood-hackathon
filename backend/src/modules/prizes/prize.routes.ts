import { Router, Request, Response, NextFunction } from "express";
import { prizeService } from "./prize.service";
import { createPrizeSchema, updatePrizeSchema } from "./prize.schema";
import { requireAuthenticatedUser } from "../../middleware/auth.middleware";
import { requireEventOrganizer } from "../../middleware/rbac.middleware";

export const prizeRouter = Router({ mergeParams: true });

// POST /api/events/:eventId/prizes
prizeRouter.post(
  "/",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const parsed = createPrizeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid prize data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const prize = await prizeService.createPrize(eventId, parsed.data);
      res.status(201).json({ prize });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "PRIZE_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// GET /api/events/:eventId/prizes
prizeRouter.get(
  "/",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const prizes = await prizeService.listPrizes(eventId);
      res.status(200).json({ prizes });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "PRIZE_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// PATCH /api/events/:eventId/prizes/:prizeId
prizeRouter.patch(
  "/:prizeId",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const prizeId = req.params.prizeId as string;
      const parsed = updatePrizeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid prize update data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const prize = await prizeService.updatePrize(eventId, prizeId, parsed.data);
      res.status(200).json({ prize });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "PRIZE_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// DELETE /api/events/:eventId/prizes/:prizeId
prizeRouter.delete(
  "/:prizeId",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const prizeId = req.params.prizeId as string;
      const result = await prizeService.deletePrize(eventId, prizeId);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "PRIZE_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);
