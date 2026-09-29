import { Router, Request, Response, NextFunction } from "express";
import { userService } from "./user.service";
import { listUsersQuerySchema, updateUserSchema } from "./user.schema";
import { requireAuthenticatedUser } from "../../middleware/auth.middleware";
import { requireGlobalAdmin, requireAdminOrOrganizer } from "../../middleware/rbac.middleware";

export const userRouter = Router();

// GET /api/users (List users - Admin or Organizer)
userRouter.get(
  "/",
  requireAuthenticatedUser,
  requireAdminOrOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = listUsersQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid query parameters.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await userService.listUsers(parsed.data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/users/:userId (Get user profile - Self, Admin, or Organizer)
userRouter.get(
  "/:userId",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;

      // Allow self-lookup or admin/organizer lookup
      if (req.user!.id !== userId && req.user!.globalRole !== "SUPER_ADMIN") {
        res.status(403).json({
          error: "FORBIDDEN",
          message: "Access denied: You can only view your own user details.",
        });
        return;
      }

      const user = await userService.getUserById(userId);
      res.status(200).json({ user });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "USER_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// PATCH /api/users/:userId (Update user role/status - Admin only)
userRouter.patch(
  "/:userId",
  requireAuthenticatedUser,
  requireGlobalAdmin,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId as string;
      const parsed = updateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid user update data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const user = await userService.updateUser(userId, parsed.data, req.user!.id, req.ip);
      res.status(200).json({ user });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "USER_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);
