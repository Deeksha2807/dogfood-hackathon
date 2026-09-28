import { prisma } from "../../config/database";
import { CreateSubmissionInput, UpdateSubmissionInput } from "./submission.schema";
import { SubmissionStatus } from "@prisma/client";

export class SubmissionService {
  /**
   * Creates a submission for an event team.
   * Enforces event deadline, team event consistency, and track event consistency.
   */
  async createSubmission(eventId: string, userId: string, input: CreateSubmissionInput) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    // Enforce submission deadline
    if (new Date() > event.submissionDeadline) {
      const error: any = new Error(
        "Submission deadline has passed. New submissions are no longer accepted."
      );
      error.statusCode = 422;
      error.code = "SUBMISSION_DEADLINE_EXPIRED";
      throw error;
    }

    // Verify team exists and belongs to this event
    const team = await prisma.team.findUnique({
      where: { id: input.teamId },
    });

    if (!team) {
      const error: any = new Error("Team not found.");
      error.statusCode = 404;
      error.code = "TEAM_NOT_FOUND";
      throw error;
    }

    if (team.eventId !== eventId) {
      const error: any = new Error(
        "Cross-event violation: Team does not belong to the specified event."
      );
      error.statusCode = 400;
      error.code = "CROSS_EVENT_TEAM_MISMATCH";
      throw error;
    }

    // Verify user is a member of this team
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: input.teamId,
          userId,
        },
      },
    });

    if (!membership) {
      const error: any = new Error(
        "Access denied: You must be a member of this team to create a submission."
      );
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Verify track exists and belongs to this event
    const track = await prisma.track.findFirst({
      where: { id: input.trackId, eventId },
    });

    if (!track) {
      const error: any = new Error(
        "Cross-event violation: The specified track does not exist in this event."
      );
      error.statusCode = 400;
      error.code = "CROSS_EVENT_TRACK_MISMATCH";
      throw error;
    }

    // Enforce 1 submission per team
    const existingSubmission = await prisma.submission.findUnique({
      where: { teamId: input.teamId },
    });

    if (existingSubmission) {
      const error: any = new Error("This team already has a submission registered.");
      error.statusCode = 409;
      error.code = "SUBMISSION_ALREADY_EXISTS";
      throw error;
    }

    const isDraft = input.isDraft ?? true;
    const status = isDraft ? SubmissionStatus.DRAFT : SubmissionStatus.SUBMITTED;
    const submittedAt = isDraft ? null : new Date();

    return prisma.submission.create({
      data: {
        eventId,
        teamId: input.teamId,
        trackId: input.trackId,
        projectName: input.projectName,
        tagline: input.tagline,
        description: input.description,
        repoUrl: input.repoUrl || null,
        demoUrl: input.demoUrl || null,
        videoUrl: input.videoUrl || null,
        isDraft,
        status,
        submittedAt,
      },
      include: {
        track: true,
        team: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });
  }

  async getSubmission(eventId: string, submissionId: string) {
    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, eventId },
      include: {
        track: true,
        team: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!submission) {
      const error: any = new Error("Submission not found in this event.");
      error.statusCode = 404;
      error.code = "SUBMISSION_NOT_FOUND";
      throw error;
    }

    return submission;
  }

  async updateSubmission(
    eventId: string,
    submissionId: string,
    userId: string,
    input: UpdateSubmissionInput
  ) {
    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, eventId },
      include: {
        event: true,
        team: {
          include: { members: true },
        },
      },
    });

    if (!submission) {
      const error: any = new Error("Submission not found in this event.");
      error.statusCode = 404;
      error.code = "SUBMISSION_NOT_FOUND";
      throw error;
    }

    // Verify user is a member of this submission's team
    const isMember = submission.team.members.some((m) => m.userId === userId);
    if (!isMember) {
      const error: any = new Error(
        "Access denied: You are not authorized to edit another team's submission."
      );
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Enforce submission deadline: Once deadline passes, all edits are rejected
    if (new Date() > submission.event.submissionDeadline) {
      const error: any = new Error(
        "Submission deadline has passed. Edits are no longer permitted."
      );
      error.statusCode = 422;
      error.code = "SUBMISSION_DEADLINE_EXPIRED";
      throw error;
    }

    // Cross-event track validation
    if (input.trackId) {
      const track = await prisma.track.findFirst({
        where: { id: input.trackId, eventId },
      });

      if (!track) {
        const error: any = new Error(
          "Cross-event violation: The specified track does not exist in this event."
        );
        error.statusCode = 400;
        error.code = "CROSS_EVENT_TRACK_MISMATCH";
        throw error;
      }
    }

    return prisma.submission.update({
      where: { id: submissionId },
      data: {
        ...(input.projectName !== undefined && { projectName: input.projectName }),
        ...(input.tagline !== undefined && { tagline: input.tagline }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.repoUrl !== undefined && { repoUrl: input.repoUrl || null }),
        ...(input.demoUrl !== undefined && { demoUrl: input.demoUrl || null }),
        ...(input.videoUrl !== undefined && { videoUrl: input.videoUrl || null }),
        ...(input.trackId !== undefined && { trackId: input.trackId }),
      },
      include: {
        track: true,
        team: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });
  }

  async finalizeSubmission(eventId: string, submissionId: string, userId: string) {
    const submission = await prisma.submission.findFirst({
      where: { id: submissionId, eventId },
      include: {
        event: true,
        team: {
          include: { members: true },
        },
      },
    });

    if (!submission) {
      const error: any = new Error("Submission not found in this event.");
      error.statusCode = 404;
      error.code = "SUBMISSION_NOT_FOUND";
      throw error;
    }

    // Verify user is a member of this submission's team
    const isMember = submission.team.members.some((m) => m.userId === userId);
    if (!isMember) {
      const error: any = new Error(
        "Access denied: You are not authorized to finalize another team's submission."
      );
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Enforce submission deadline
    if (new Date() > submission.event.submissionDeadline) {
      const error: any = new Error(
        "Submission deadline has passed. Cannot finalize submission."
      );
      error.statusCode = 422;
      error.code = "SUBMISSION_DEADLINE_EXPIRED";
      throw error;
    }

    return prisma.submission.update({
      where: { id: submissionId },
      data: {
        isDraft: false,
        status: SubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
      },
      include: {
        track: true,
        team: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        },
      },
    });
  }
}

export const submissionService = new SubmissionService();
