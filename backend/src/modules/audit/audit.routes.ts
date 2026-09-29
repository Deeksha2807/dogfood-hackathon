import { Router, Request, Response, NextFunction } from "express";
import { auditService } from "./audit.service";
import { requireAuthenticatedUser } from "../../middleware/auth.middleware";
import { requireAdminOrOrganizer } from "../../middleware/rbac.middleware";

export const auditRouter = Router();

// GET /api/audit (Query audit logs - Admin or Organizer)
auditRouter.get(
  "/",
  requireAuthenticatedUser,
  requireAdminOrOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { action, entityType, entityId, userId, page, limit } = req.query;

      const result = await auditService.queryLogs({
        action: typeof action === "string" ? action : undefined,
        entityType: typeof entityType === "string" ? entityType : undefined,
        entityId: typeof entityId === "string" ? entityId : undefined,
        userId: typeof userId === "string" ? userId : undefined,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);
