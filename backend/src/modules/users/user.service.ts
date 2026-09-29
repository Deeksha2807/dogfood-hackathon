import { prisma } from "../../config/database";
import { ListUsersQuery, UpdateUserInput } from "./user.schema";
import { Prisma } from "@prisma/client";
import { auditService } from "../audit/audit.service";

export class UserService {
  async listUsers(query: Partial<ListUsersQuery> = {}) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(query.globalRole && { globalRole: query.globalRole }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: "insensitive" } },
          { email: { contains: query.search, mode: "insensitive" } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          globalRole: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          eventRoles: {
            select: {
              eventId: true,
              role: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        globalRole: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        eventRoles: {
          include: {
            event: {
              select: { id: true, name: true, status: true },
            },
          },
        },
        teamMembers: {
          include: {
            team: {
              select: { id: true, name: true, eventId: true },
            },
          },
        },
      },
    });

    if (!user) {
      const error: any = new Error("User not found.");
      error.statusCode = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    return user;
  }

  async updateUser(
    userId: string,
    input: UpdateUserInput,
    actorId: string,
    ipAddress?: string | null
  ) {
    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      const error: any = new Error("User not found.");
      error.statusCode = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If deactivating user, bump tokenVersion to invalidate active sessions
      const nextTokenVersion =
        input.isActive === false ? existing.tokenVersion + 1 : existing.tokenVersion;

      const user = await tx.user.update({
        where: { id: userId },
        data: {
          ...(input.name !== undefined && { name: input.name }),
          ...(input.isActive !== undefined && { isActive: input.isActive }),
          ...(input.globalRole !== undefined && { globalRole: input.globalRole }),
          tokenVersion: nextTokenVersion,
        },
        select: {
          id: true,
          email: true,
          name: true,
          globalRole: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (input.isActive === false) {
        await tx.session.updateMany({
          where: { userId },
          data: { isValid: false },
        });
      }

      return user;
    });

    await auditService.log({
      userId: actorId,
      action: "USER_UPDATED",
      entityType: "USER",
      entityId: userId,
      oldValue: {
        name: existing.name,
        isActive: existing.isActive,
        globalRole: existing.globalRole,
      },
      newValue: {
        name: updated.name,
        isActive: updated.isActive,
        globalRole: updated.globalRole,
      },
      ipAddress,
    });

    return updated;
  }
}

export const userService = new UserService();
