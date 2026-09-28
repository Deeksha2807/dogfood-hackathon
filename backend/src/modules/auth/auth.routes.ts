import { Router, Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { config } from "../../config/env";
import { requireAuthenticatedUser } from "../../middleware/auth.middleware";

export const authRouter = Router();

const cookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: config.sessionMaxAgeMs,
};

// POST /api/auth/register
authRouter.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid registration input.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const user = await authService.register(parsed.data);

      res.status(201).json({
        message: "User registered successfully.",
        user,
      });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "REGISTRATION_FAILED",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// POST /api/auth/login
authRouter.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid login credentials provided.",
        });
        return;
      }

      const sessionResult = await authService.login(parsed.data, {
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers["user-agent"],
      });

      // Set secure HTTP-only session cookie
      res.cookie(config.sessionCookieName, sessionResult.rawToken, cookieOptions);

      res.status(200).json({
        message: "Login successful.",
        user: sessionResult.user,
      });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "AUTHENTICATION_FAILED",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// POST /api/auth/logout
authRouter.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token =
        req.cookies?.[config.sessionCookieName] ||
        (req.headers.authorization?.startsWith("Bearer ")
          ? req.headers.authorization.slice(7)
          : null);

      if (token) {
        await authService.logout(token);
      }

      const { maxAge: _, ...clearCookieOptions } = cookieOptions;
      res.clearCookie(config.sessionCookieName, clearCookieOptions);

      res.status(200).json({
        message: "Logged out successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
authRouter.get(
  "/me",
  requireAuthenticatedUser,
  async (req: Request, res: Response): Promise<void> => {
    // req.user has passwordHash already stripped by middleware
    res.status(200).json({
      user: req.user,
    });
  }
);
