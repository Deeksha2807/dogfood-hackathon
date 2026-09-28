import crypto from "crypto";
import { prisma } from "../../config/database";
import { EventRoleType, JudgeInviteStatus } from "@prisma/client";
import { CreateJudgeInvitationInput } from "./judge-invitation.schema";
import { auditService } from "../audit/audit.service";

export class JudgeInvitationService {
  async createInvitation(
    eventId: string,
    invitedByUserId: string,
    input: CreateJudgeInvitationInput,
    ipAddress?: string
  ) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    const email = input.email.toLowerCase();

    // Check if user with this email already has JUDGE role in this event
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingRole = await prisma.eventRole.findUnique({
        where: {
          eventId_userId_role: {
            eventId,
            userId: existingUser.id,
            role: EventRoleType.JUDGE,
          },
        },
      });

      if (existingRole) {
        const error: any = new Error("User is already a judge for this event.");
        error.statusCode = 409;
        error.code = "ALREADY_EVENT_JUDGE";
        throw error;
      }
    }

    // Check if a pending invite already exists for this event and email
    const existingInvitation = await prisma.judgeInvitation.findUnique({
      where: {
        eventId_email: {
          eventId,
          email,
        },
      },
    });

    const now = new Date();
    if (existingInvitation && existingInvitation.status === JudgeInviteStatus.PENDING && existingInvitation.expiresAt > now) {
      const error: any = new Error("A pending invitation has already been sent to this email address.");
      error.statusCode = 409;
      error.code = "INVITATION_ALREADY_PENDING";
      throw error;
    }

    const invitationToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + (input.expiresInHours || 168) * 3600000);

    let invitation;
    if (existingInvitation) {
      // Update existing expired or revoked invitation with fresh token
      invitation = await prisma.judgeInvitation.update({
        where: { id: existingInvitation.id },
        data: {
          invitationToken,
          invitedByUserId,
          status: JudgeInviteStatus.PENDING,
          expiresAt,
          acceptedAt: null,
        },
      });
    } else {
      invitation = await prisma.judgeInvitation.create({
        data: {
          eventId,
          email,
          invitationToken,
          invitedByUserId,
          status: JudgeInviteStatus.PENDING,
          expiresAt,
        },
      });
    }

    await auditService.log({
      userId: invitedByUserId,
      action: "JUDGE_INVITATION_CREATED",
      entityType: "JudgeInvitation",
      entityId: invitation.id,
      newValue: {
        eventId,
        email,
        expiresAt,
      },
      ipAddress,
    });

    return invitation;
  }

  async getInvitations(eventId: string) {
    return prisma.judgeInvitation.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
    });
  }

  async acceptInvitation(
    eventId: string,
    invitationIdentifier: string,
    user: { id: string; email: string },
    ipAddress?: string
  ) {
    // Find invitation by id or invitationToken
    const invitation = await prisma.judgeInvitation.findFirst({
      where: {
        eventId,
        OR: [
          { id: invitationIdentifier },
          { invitationToken: invitationIdentifier },
        ],
      },
    });

    if (!invitation) {
      const error: any = new Error("Judge invitation not found.");
      error.statusCode = 404;
      error.code = "INVITATION_NOT_FOUND";
      throw error;
    }

    if (invitation.eventId !== eventId) {
      const error: any = new Error("This invitation belongs to a different event.");
      error.statusCode = 400;
      error.code = "CROSS_EVENT_INVITATION_MISMATCH";
      throw error;
    }

    if (invitation.status === JudgeInviteStatus.REVOKED) {
      const error: any = new Error("This invitation has been revoked.");
      error.statusCode = 400;
      error.code = "INVITATION_REVOKED";
      throw error;
    }

    if (invitation.status === JudgeInviteStatus.ACCEPTED) {
      const error: any = new Error("This invitation has already been accepted.");
      error.statusCode = 400;
      error.code = "INVITATION_ALREADY_ACCEPTED";
      throw error;
    }

    if (invitation.status === JudgeInviteStatus.EXPIRED || invitation.expiresAt <= new Date()) {
      if (invitation.status !== JudgeInviteStatus.EXPIRED) {
        await prisma.judgeInvitation.update({
          where: { id: invitation.id },
          data: { status: JudgeInviteStatus.EXPIRED },
        });
      }
      const error: any = new Error("This invitation has expired.");
      error.statusCode = 400;
      error.code = "INVITATION_EXPIRED";
      throw error;
    }

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      const error: any = new Error("Access denied: This invitation was issued to a different email address.");
      error.statusCode = 403;
      error.code = "EMAIL_MISMATCH";
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const updatedInvitation = await tx.judgeInvitation.update({
        where: { id: invitation.id },
        data: {
          status: JudgeInviteStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      });

      await tx.eventRole.upsert({
        where: {
          eventId_userId_role: {
            eventId,
            userId: user.id,
            role: EventRoleType.JUDGE,
          },
        },
        create: {
          eventId,
          userId: user.id,
          role: EventRoleType.JUDGE,
        },
        update: {},
      });

      await auditService.log({
        userId: user.id,
        action: "JUDGE_INVITATION_ACCEPTED",
        entityType: "JudgeInvitation",
        entityId: invitation.id,
        newValue: {
          acceptedByUserId: user.id,
          email: user.email,
        },
        ipAddress,
      });

      return {
        message: "Successfully accepted judge invitation.",
        invitation: updatedInvitation,
      };
    });
  }

  async revokeInvitation(
    eventId: string,
    invitationId: string,
    organizerUserId: string,
    ipAddress?: string
  ) {
    const invitation = await prisma.judgeInvitation.findFirst({
      where: {
        id: invitationId,
        eventId,
      },
    });

    if (!invitation) {
      const error: any = new Error("Judge invitation not found.");
      error.statusCode = 404;
      error.code = "INVITATION_NOT_FOUND";
      throw error;
    }

    if (invitation.status === JudgeInviteStatus.ACCEPTED) {
      const error: any = new Error("Cannot revoke an invitation that has already been accepted.");
      error.statusCode = 400;
      error.code = "CANNOT_REVOKE_ACCEPTED_INVITATION";
      throw error;
    }

    const updated = await prisma.judgeInvitation.update({
      where: { id: invitation.id },
      data: { status: JudgeInviteStatus.REVOKED },
    });

    await auditService.log({
      userId: organizerUserId,
      action: "JUDGE_INVITATION_REVOKED",
      entityType: "JudgeInvitation",
      entityId: invitation.id,
      ipAddress,
    });

    return updated;
  }
}

export const judgeInvitationService = new JudgeInvitationService();
