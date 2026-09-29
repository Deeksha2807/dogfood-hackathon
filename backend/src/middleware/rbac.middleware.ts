import { Request, Response, NextFunction } from "express";
import { EventRoleType } from "@prisma/client";
import { prisma } from "../config/database";

/**
 * Middleware: Requires the user to hold one of the specified EventRoles for the eventId in req.params.
 * Permissions are evaluated strictly against the event, not solely on a global role.
 */
export function requireEventRole(allowedRoles: EventRoleType[] = []) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: "UNAUTHORIZED",
          message: "Authentication required.",
        });
        return;
      }

      const paramEventId = req.params.eventId;
      const eventId: string | undefined =
        (Array.isArray(paramEventId) ? paramEventId[0] : paramEventId) ||
        (typeof req.body?.eventId === "string" ? req.body.eventId : undefined) ||
        (typeof req.query?.eventId === "string" ? req.query.eventId : undefined);

      if (!eventId) {
        res.status(400).json({
          error: "BAD_REQUEST",
          message: "Event ID parameter is required for authorization.",
        });
        return;
      }

      // Query the user's specific role for this event
      const eventRole = await prisma.eventRole.findFirst({
        where: {
          eventId,
          userId: req.user.id,
        },
      });

      if (!eventRole) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "Access denied: You do not have a role assigned in this event.",
        });
        return;
      }

      // If specific roles are mandated, check that the user's role is in the allowed list
      if (allowedRoles.length > 0 && !allowedRoles.includes(eventRole.role)) {
        res.status(403).json({
          error: "FORBIDDEN",
          message: `Access denied: Requires ${allowedRoles.join(" or ")} role in this event.`,
        });
        return;
      }

      req.eventRole = eventRole;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const requireEventOrganizer = requireEventRole([EventRoleType.ORGANIZER]);
export const requireEventJudge = requireEventRole([EventRoleType.JUDGE]);
export const requireEventParticipant = requireEventRole([EventRoleType.PARTICIPANT]);
export const requireAnyEventRole = requireEventRole([]);

/**
 * Middleware: Requires global SUPER_ADMIN role.
 */
export function requireGlobalAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Authentication required.",
    });
    return;
  }
  if (req.user.globalRole !== "SUPER_ADMIN") {
    res.status(403).json({
      error: "FORBIDDEN",
      message: "Access denied: Requires administrator privileges.",
    });
    return;
  }
  next();
}

/**
 * Middleware: Requires either global SUPER_ADMIN role or an event ORGANIZER role.
 */
export async function requireAdminOrOrganizer(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      error: "UNAUTHORIZED",
      message: "Authentication required.",
    });
    return;
  }

  if (req.user.globalRole === "SUPER_ADMIN") {
    return next();
  }

  // Check if user is organizer in any event
  const isOrganizer = await prisma.eventRole.findFirst({
    where: { userId: req.user.id, role: EventRoleType.ORGANIZER },
  });

  if (!isOrganizer) {
    res.status(403).json({
      error: "FORBIDDEN",
      message: "Access denied: Requires administrator or organizer role.",
    });
    return;
  }

  next();
}

