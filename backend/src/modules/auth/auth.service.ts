import { prisma } from "../../config/database";
import { config } from "../../config/env";
import { hashPassword, verifyPassword, generateSessionToken, hashSessionToken } from "../../utils/crypto";
import { RegisterInput, LoginInput } from "./auth.schema";
import { SafeUser } from "../../types/express";

export interface SessionResult {
  rawToken: string;
  user: SafeUser;
  expiresAt: Date;
}

export class AuthService {
  /**
   * Registers a new user. Throws safe error if email is already in use.
   */
  async register(input: RegisterInput): Promise<SafeUser> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      const error: any = new Error("An account with this email address already exists.");
      error.statusCode = 400;
      error.code = "EMAIL_ALREADY_EXISTS";
      throw error;
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        globalRole: "USER",
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Authenticates user with email and password and creates a database-backed session.
   * Returns generic safe error on mismatch without revealing account existence.
   */
  async login(
    input: LoginInput,
    metadata: { ipAddress?: string; userAgent?: string } = {}
  ): Promise<SessionResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.isActive) {
      const error: any = new Error("Invalid email or password.");
      error.statusCode = 401;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const isMatch = await verifyPassword(input.password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error("Invalid email or password.");
      error.statusCode = 401;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    const rawToken = generateSessionToken();
    const sessionTokenHash = hashSessionToken(rawToken);
    const expiresAt = new Date(Date.now() + config.sessionMaxAgeMs);

    await prisma.session.create({
      data: {
        sessionTokenHash,
        userId: user.id,
        tokenVersion: user.tokenVersion,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent,
        expiresAt,
        isValid: true,
      },
    });

    const { passwordHash: _, ...safeUser } = user;
    return {
      rawToken,
      user: safeUser,
      expiresAt,
    };
  }

  /**
   * Invalidates a session in the database given the raw token.
   */
  async logout(rawToken: string): Promise<void> {
    if (!rawToken) return;

    const sessionTokenHash = hashSessionToken(rawToken);

    await prisma.session.updateMany({
      where: { sessionTokenHash },
      data: { isValid: false },
    });
  }
}

export const authService = new AuthService();
