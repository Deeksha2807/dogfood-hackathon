import { prisma } from "../../config/database";
import { CreateEventInput, UpdateEventInput } from "./event.schema";
import { EventRoleType } from "@prisma/client";

export class EventService {
  /**
   * Creates a new event and establishes the creator's event-scoped ORGANIZER role atomically.
   */
  async createEvent(userId: string, input: CreateEventInput) {
    return prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          name: input.name,
          description: input.description,
          status: input.status,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          submissionDeadline: new Date(input.submissionDeadline),
          judgingDeadline: new Date(input.judgingDeadline),
          maxTeamSize: input.maxTeamSize,
        },
      });

      // Grant creator ORGANIZER role in this event
      await tx.eventRole.create({
        data: {
          eventId: event.id,
          userId,
          role: EventRoleType.ORGANIZER,
        },
      });

      return event;
    });
  }

  /**
   * Retrieves an event by its ID.
   */
  async getEventById(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        tracks: true,
        prizes: true,
        _count: {
          select: {
            teams: true,
            submissions: true,
          },
        },
      },
    });

    if (!event) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    return event;
  }

  /**
   * Updates an existing event configuration.
   */
  async updateEvent(eventId: string, input: UpdateEventInput) {
    const existing = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!existing) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    const startDate = input.startDate ? new Date(input.startDate) : existing.startDate;
    const endDate = input.endDate ? new Date(input.endDate) : existing.endDate;

    if (endDate <= startDate) {
      const error: any = new Error("Event end date must be after start date.");
      error.statusCode = 400;
      error.code = "INVALID_DATE_RANGE";
      throw error;
    }

    const submissionDeadline = input.submissionDeadline
      ? new Date(input.submissionDeadline)
      : existing.submissionDeadline;
    const judgingDeadline = input.judgingDeadline
      ? new Date(input.judgingDeadline)
      : existing.judgingDeadline;

    if (submissionDeadline < startDate || submissionDeadline > endDate) {
      const error: any = new Error(
        "Submission deadline must be between event start and end date."
      );
      error.statusCode = 400;
      error.code = "INVALID_DEADLINE";
      throw error;
    }

    if (judgingDeadline < submissionDeadline) {
      const error: any = new Error(
        "Judging deadline must be at or after the submission deadline."
      );
      error.statusCode = 400;
      error.code = "INVALID_DEADLINE";
      throw error;
    }

    const updated = await prisma.event.update({
      where: { id: eventId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.startDate !== undefined && { startDate }),
        ...(input.endDate !== undefined && { endDate }),
        ...(input.submissionDeadline !== undefined && { submissionDeadline }),
        ...(input.judgingDeadline !== undefined && { judgingDeadline }),
        ...(input.maxTeamSize !== undefined && { maxTeamSize: input.maxTeamSize }),
        ...(input.resultsPublished !== undefined && { resultsPublished: input.resultsPublished }),
      },
    });

    return updated;
  }
}

export const eventService = new EventService();
