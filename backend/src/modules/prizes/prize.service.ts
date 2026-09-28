import { prisma } from "../../config/database";
import { CreatePrizeInput, UpdatePrizeInput } from "./prize.schema";

export class PrizeService {
  async createPrize(eventId: string, input: CreatePrizeInput) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    // Cross-event track validation
    if (input.trackId) {
      const track = await prisma.track.findFirst({
        where: { id: input.trackId, eventId },
      });

      if (!track) {
        const error: any = new Error(
          "Invalid trackId: The specified track does not exist or does not belong to this event."
        );
        error.statusCode = 400;
        error.code = "CROSS_EVENT_TRACK_MISMATCH";
        throw error;
      }
    }

    return prisma.prize.create({
      data: {
        eventId,
        name: input.name,
        description: input.description,
        cashValue: input.cashValue,
        trackId: input.trackId,
      },
      include: {
        track: true,
      },
    });
  }

  async listPrizes(eventId: string) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    return prisma.prize.findMany({
      where: { eventId },
      include: {
        track: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async updatePrize(eventId: string, prizeId: string, input: UpdatePrizeInput) {
    const prize = await prisma.prize.findFirst({
      where: { id: prizeId, eventId },
    });

    if (!prize) {
      const error: any = new Error("Prize not found in this event.");
      error.statusCode = 404;
      error.code = "PRIZE_NOT_FOUND";
      throw error;
    }

    // Cross-event track validation if trackId is changing
    if (input.trackId) {
      const track = await prisma.track.findFirst({
        where: { id: input.trackId, eventId },
      });

      if (!track) {
        const error: any = new Error(
          "Invalid trackId: The specified track does not exist or does not belong to this event."
        );
        error.statusCode = 400;
        error.code = "CROSS_EVENT_TRACK_MISMATCH";
        throw error;
      }
    }

    return prisma.prize.update({
      where: { id: prizeId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.cashValue !== undefined && { cashValue: input.cashValue }),
        ...(input.trackId !== undefined && { trackId: input.trackId }),
      },
      include: {
        track: true,
      },
    });
  }

  async deletePrize(eventId: string, prizeId: string) {
    const prize = await prisma.prize.findFirst({
      where: { id: prizeId, eventId },
    });

    if (!prize) {
      const error: any = new Error("Prize not found in this event.");
      error.statusCode = 404;
      error.code = "PRIZE_NOT_FOUND";
      throw error;
    }

    await prisma.prize.delete({
      where: { id: prizeId },
    });

    return { message: "Prize deleted successfully." };
  }
}

export const prizeService = new PrizeService();
