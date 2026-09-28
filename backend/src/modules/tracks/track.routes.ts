import { Router, Request, Response, NextFunction } from "express";
import { trackService } from "./track.service";
import { createTrackSchema, updateTrackSchema } from "./track.schema";
import { requireAuthenticatedUser } from "../../middleware/auth.middleware";
import { requireEventOrganizer } from "../../middleware/rbac.middleware";

export const trackRouter = Router({ mergeParams: true });

// POST /api/events/:eventId/tracks
trackRouter.post(
  "/",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const parsed = createTrackSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid track data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const track = await trackService.createTrack(eventId, parsed.data);
      res.status(201).json({ track });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "TRACK_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// GET /api/events/:eventId/tracks
trackRouter.get(
  "/",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const tracks = await trackService.listTracks(eventId);
      res.status(200).json({ tracks });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "TRACK_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// PATCH /api/events/:eventId/tracks/:trackId
trackRouter.patch(
  "/:trackId",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const trackId = req.params.trackId as string;
      const parsed = updateTrackSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid track update data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const track = await trackService.updateTrack(eventId, trackId, parsed.data);
      res.status(200).json({ track });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "TRACK_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// DELETE /api/events/:eventId/tracks/:trackId
trackRouter.delete(
  "/:trackId",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const trackId = req.params.trackId as string;
      const result = await trackService.deleteTrack(eventId, trackId);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "TRACK_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);
