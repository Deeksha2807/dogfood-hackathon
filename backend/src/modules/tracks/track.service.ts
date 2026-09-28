import { prisma } from "../../config/database";
import { CreateTrackInput, UpdateTrackInput } from "./track.schema";

export class TrackService {
  async createTrack(eventId: string, input: CreateTrackInput) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    const existing = await prisma.track.findUnique({
      where: {
        eventId_name: {
          eventId,
          name: input.name,
        },
      },
    });

    if (existing) {
      const error: any = new Error("A track with this name already exists in this event.");
      error.statusCode = 409;
      error.code = "TRACK_ALREADY_EXISTS";
      throw error;
    }

    return prisma.track.create({
      data: {
        eventId,
        name: input.name,
        description: input.description,
      },
    });
  }

  async listTracks(eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    return prisma.track.findMany({
      where: { eventId },
      orderBy: { createdAt: "asc" },
    });
  }

  async updateTrack(eventId: string, trackId: string, input: UpdateTrackInput) {
    const track = await prisma.track.findFirst({
      where: { id: trackId, eventId },
    });

    if (!track) {
      const error: any = new Error("Track not found in this event.");
      error.statusCode = 404;
      error.code = "TRACK_NOT_FOUND";
      throw error;
    }

    if (input.name && input.name !== track.name) {
      const duplicate = await prisma.track.findUnique({
        where: {
          eventId_name: {
            eventId,
            name: input.name,
          },
        },
      });

      if (duplicate) {
        const error: any = new Error("A track with this name already exists in this event.");
        error.statusCode = 409;
        error.code = "TRACK_ALREADY_EXISTS";
        throw error;
      }
    }

    return prisma.track.update({
      where: { id: trackId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
      },
    });
  }

  async deleteTrack(eventId: string, trackId: string) {
    const track = await prisma.track.findFirst({
      where: { id: trackId, eventId },
    });

    if (!track) {
      const error: any = new Error("Track not found in this event.");
      error.statusCode = 404;
      error.code = "TRACK_NOT_FOUND";
      throw error;
    }

    const submissionsCount = await prisma.submission.count({
      where: { trackId, eventId },
    });

    if (submissionsCount > 0) {
      const error: any = new Error("Cannot delete track referenced by existing submissions.");
      error.statusCode = 409;
      error.code = "TRACK_IN_USE";
      throw error;
    }

    await prisma.track.delete({
      where: { id: trackId },
    });

    return { message: "Track deleted successfully." };
  }
}

export const trackService = new TrackService();
