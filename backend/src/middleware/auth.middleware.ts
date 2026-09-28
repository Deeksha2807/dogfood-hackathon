import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database";
import { config } from "../config/env";
import { hashSessionToken } from "../utils/crypto";
import { SafeUser } from "../types/express";

/**
 * Resolves session from cookie or Authorization header, validating database state.
 */
export async function resolveSession(req: Request): Promise<{
  user: SafeUser;
  session: any;
} | null> {
  const token =
    req.cookies?.[config.sessionCookieName] ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return null;
  }

  const sessionTokenHash = hashSessionToken(token);

  const session = await prisma.session.findUnique({
    where: { sessionTokenHash },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Reject invalidated or expired sessions
  if (!session.isValid || session.expiresAt <= new Date()) {
    return null;
  }

  // Reject inactive users
  if (!session.user.isActive) {
    return null;
  }

  // Respect tokenVersion invalidation
  if (session.tokenVersion !== session.user.tokenVersion) {
    return null;
  }

  const { passwordHash, ...safeUser } = session.user;

  return {
    user: safeUser,
    session,
  };
}

/**
 * Middleware: Requires a valid active database session.
 */
export async function requireAuthenticatedUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = await resolveSession(req);

    if (!auth) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Authentication required. Please log in.",
      });
      return;
    }

    req.user = auth.user;
    req.session = auth.session;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware: Optionally attaches authenticated user/session if present and valid.
 */
export async function optionalAuthenticatedUser(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = await resolveSession(req);
    if (auth) {
      req.user = auth.user;
      req.session = auth.session;
    }
    next();
  } catch (error) {
    next(error);
  }
}
