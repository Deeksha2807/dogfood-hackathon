import { prisma } from "../../config/database";

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string | null;
}

export class AuditService {
  async log(params: CreateAuditLogParams) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          oldValue: params.oldValue ? JSON.parse(JSON.stringify(params.oldValue)) : undefined,
          newValue: params.newValue ? JSON.parse(JSON.stringify(params.newValue)) : undefined,
          ipAddress: params.ipAddress || null,
        },
      });
    } catch (err) {
      console.error("Failed to create audit log:", err);
      return null;
    }
  }
}

export const auditService = new AuditService();
