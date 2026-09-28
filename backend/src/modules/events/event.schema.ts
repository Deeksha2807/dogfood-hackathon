import { z } from "zod";
import { EventStatus } from "@prisma/client";

export const createEventSchema = z
  .object({
    name: z.string().min(1, "Event name is required").max(255),
    description: z.string().optional(),
    status: z.nativeEnum(EventStatus).optional().default(EventStatus.UPCOMING),
    startDate: z.string().datetime({ message: "Invalid start date format (ISO-8601 required)" }),
    endDate: z.string().datetime({ message: "Invalid end date format (ISO-8601 required)" }),
    submissionDeadline: z
      .string()
      .datetime({ message: "Invalid submission deadline format (ISO-8601 required)" }),
    judgingDeadline: z
      .string()
      .datetime({ message: "Invalid judging deadline format (ISO-8601 required)" }),
    maxTeamSize: z.number().int().min(1).max(20).optional().default(4),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "Event end date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      new Date(data.submissionDeadline) >= new Date(data.startDate) &&
      new Date(data.submissionDeadline) <= new Date(data.endDate),
    {
      message: "Submission deadline must be between event start and end date",
      path: ["submissionDeadline"],
    }
  )
  .refine((data) => new Date(data.judgingDeadline) >= new Date(data.submissionDeadline), {
    message: "Judging deadline must be at or after the submission deadline",
    path: ["judgingDeadline"],
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    status: z.nativeEnum(EventStatus).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    submissionDeadline: z.string().datetime().optional(),
    judgingDeadline: z.string().datetime().optional(),
    maxTeamSize: z.number().int().min(1).max(20).optional(),
    resultsPublished: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "Event end date must be after start date",
      path: ["endDate"],
    }
  );

export type UpdateEventInput = z.infer<typeof updateEventSchema>;
