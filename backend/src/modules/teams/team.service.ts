import crypto from "crypto";
import { prisma } from "../../config/database";
import { CreateTeamInput, UpdateTeamInput, CreateInviteInput } from "./team.schema";
import { TeamRole, EventRoleType } from "@prisma/client";

export class TeamService {
  /**
   * Creates a team in an event with the creator as the LEADER.
   * Enforces 1-team-per-event and validates track references.
   */
  async createTeam(eventId: string, userId: string, input: CreateTeamInput) {
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    // Verify user is not already on another team in this event
    const existingMembership = await prisma.teamMember.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingMembership) {
      const error: any = new Error("You are already a member of a team in this event.");
      error.statusCode = 409;
      error.code = "ALREADY_IN_TEAM";
      throw error;
    }

    // Cross-event track validation
    if (input.trackId) {
      const track = await prisma.track.findFirst({
        where: { id: input.trackId, eventId },
      });

      if (!track) {
        const error: any = new Error(
          "Invalid trackId: The track does not exist or does not belong to this event."
        );
        error.statusCode = 400;
        error.code = "CROSS_EVENT_TRACK_MISMATCH";
        throw error;
      }
    }

    const nameDuplicate = await prisma.team.findUnique({
      where: {
        eventId_name: {
          eventId,
          name: input.name,
        },
      },
    });

    if (nameDuplicate) {
      const error: any = new Error("A team with this name already exists in this event.");
      error.statusCode = 409;
      error.code = "TEAM_NAME_TAKEN";
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          eventId,
          name: input.name,
          trackId: input.trackId,
        },
      });

      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId,
          eventId,
          role: TeamRole.LEADER,
        },
      });

      // Ensure creator has PARTICIPANT role in event
      await tx.eventRole.upsert({
        where: {
          eventId_userId_role: {
            eventId,
            userId,
            role: EventRoleType.PARTICIPANT,
          },
        },
        create: {
          eventId,
          userId,
          role: EventRoleType.PARTICIPANT,
        },
        update: {},
      });

      return tx.team.findUnique({
        where: { id: team.id },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          track: true,
        },
      });
    });
  }

  async getTeam(eventId: string, teamId: string) {
    const team = await prisma.team.findFirst({
      where: { id: teamId, eventId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        track: true,
        submission: true,
      },
    });

    if (!team) {
      const error: any = new Error("Team not found in this event.");
      error.statusCode = 404;
      error.code = "TEAM_NOT_FOUND";
      throw error;
    }

    return team;
  }

  async updateTeam(eventId: string, teamId: string, userId: string, input: UpdateTeamInput) {
    const team = await prisma.team.findFirst({
      where: { id: teamId, eventId },
    });

    if (!team) {
      const error: any = new Error("Team not found in this event.");
      error.statusCode = 404;
      error.code = "TEAM_NOT_FOUND";
      throw error;
    }

    // Only team LEADER or event ORGANIZER can modify team details
    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    const isOrganizer = await prisma.eventRole.findFirst({
      where: { eventId, userId, role: EventRoleType.ORGANIZER },
    });

    if ((!membership || membership.role !== TeamRole.LEADER) && !isOrganizer) {
      const error: any = new Error("Access denied: Only team leaders can update team details.");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Cross-event track validation
    if (input.trackId) {
      const track = await prisma.track.findFirst({
        where: { id: input.trackId, eventId },
      });

      if (!track) {
        const error: any = new Error(
          "Invalid trackId: The track does not exist or does not belong to this event."
        );
        error.statusCode = 400;
        error.code = "CROSS_EVENT_TRACK_MISMATCH";
        throw error;
      }
    }

    // Check duplicate name
    if (input.name && input.name !== team.name) {
      const nameDuplicate = await prisma.team.findUnique({
        where: {
          eventId_name: {
            eventId,
            name: input.name,
          },
        },
      });

      if (nameDuplicate) {
        const error: any = new Error("A team with this name already exists in this event.");
        error.statusCode = 409;
        error.code = "TEAM_NAME_TAKEN";
        throw error;
      }
    }

    return prisma.team.update({
      where: { id: teamId },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.trackId !== undefined && { trackId: input.trackId }),
      },
      include: {
        track: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });
  }

  async createInvite(
    eventId: string,
    teamId: string,
    userId: string,
    input: CreateInviteInput
  ) {
    const team = await prisma.team.findFirst({
      where: { id: teamId, eventId },
      include: { event: true },
    });

    if (!team) {
      const error: any = new Error("Team not found in this event.");
      error.statusCode = 404;
      error.code = "TEAM_NOT_FOUND";
      throw error;
    }

    // Check if user is a member of the team
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });

    if (!membership) {
      const error: any = new Error("Access denied: You must be a member of this team to create invites.");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Check if team is already at max capacity
    const currentMemberCount = await prisma.teamMember.count({ where: { teamId } });
    if (currentMemberCount >= team.event.maxTeamSize) {
      const error: any = new Error("Cannot create invite: Team is already at maximum capacity.");
      error.statusCode = 400;
      error.code = "TEAM_FULL";
      throw error;
    }

    // Generate secure random inviteCode and inviteToken
    const inviteCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const inviteToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + (input.expiresInHours || 72) * 3600000);

    return prisma.teamInvite.create({
      data: {
        teamId,
        inviteCode,
        inviteToken,
        targetEmail: input.targetEmail,
        maxUses: input.maxUses || 5,
        expiresAt,
      },
    });
  }

  async acceptInvite(eventId: string, inviteCode: string, user: { id: string; email: string }) {
    const invite = await prisma.teamInvite.findUnique({
      where: { inviteCode },
      include: {
        team: {
          include: { event: true },
        },
      },
    });

    if (!invite) {
      const error: any = new Error("Team invite not found.");
      error.statusCode = 404;
      error.code = "INVITE_NOT_FOUND";
      throw error;
    }

    // Cross-event check
    if (invite.team.eventId !== eventId) {
      const error: any = new Error("This invite does not belong to the requested event.");
      error.statusCode = 400;
      error.code = "CROSS_EVENT_INVITE_MISMATCH";
      throw error;
    }

    if (invite.status !== "ACTIVE") {
      const error: any = new Error("This invite is no longer active.");
      error.statusCode = 400;
      error.code = "INVITE_INACTIVE";
      throw error;
    }

    if (invite.expiresAt <= new Date()) {
      await prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      const error: any = new Error("This invite has expired.");
      error.statusCode = 400;
      error.code = "INVITE_EXPIRED";
      throw error;
    }

    if (invite.usedCount >= invite.maxUses) {
      const error: any = new Error("This invite has reached its maximum allowed uses.");
      error.statusCode = 400;
      error.code = "INVITE_MAX_USES_REACHED";
      throw error;
    }

    if (invite.targetEmail && invite.targetEmail !== user.email) {
      const error: any = new Error("This invite was specifically addressed to a different email.");
      error.statusCode = 403;
      error.code = "TARGET_EMAIL_MISMATCH";
      throw error;
    }

    // Check if user is already a member of this team
    const alreadyMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: invite.teamId,
          userId: user.id,
        },
      },
    });

    if (alreadyMember) {
      const error: any = new Error("You are already a member of this team.");
      error.statusCode = 400;
      error.code = "ALREADY_TEAM_MEMBER";
      throw error;
    }

    // Check if user is on any other team in this event
    const otherTeamMembership = await prisma.teamMember.findUnique({
      where: {
        userId_eventId: {
          userId: user.id,
          eventId,
        },
      },
    });

    if (otherTeamMembership) {
      const error: any = new Error("You are already a member of another team in this event.");
      error.statusCode = 409;
      error.code = "ALREADY_IN_TEAM";
      throw error;
    }

    // Check team capacity
    const currentMemberCount = await prisma.teamMember.count({
      where: { teamId: invite.teamId },
    });

    if (currentMemberCount >= invite.team.event.maxTeamSize) {
      const error: any = new Error("Cannot join: Team has already reached maximum capacity.");
      error.statusCode = 400;
      error.code = "TEAM_FULL";
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      await tx.teamMember.create({
        data: {
          teamId: invite.teamId,
          userId: user.id,
          eventId,
          role: TeamRole.MEMBER,
        },
      });

      const nextUsedCount = invite.usedCount + 1;
      await tx.teamInvite.update({
        where: { id: invite.id },
        data: {
          usedCount: nextUsedCount,
        },
      });

      await tx.eventRole.upsert({
        where: {
          eventId_userId_role: {
            eventId,
            userId: user.id,
            role: EventRoleType.PARTICIPANT,
          },
        },
        create: {
          eventId,
          userId: user.id,
          role: EventRoleType.PARTICIPANT,
        },
        update: {},
      });

      return {
        message: "Successfully joined the team.",
        teamId: invite.teamId,
      };
    });
  }
}

export const teamService = new TeamService();
