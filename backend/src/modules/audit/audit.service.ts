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

export interface QueryAuditLogsParams {
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  page?: number;
  limit?: number;
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

  async queryLogs(params: QueryAuditLogsParams = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(params.action && { action: params.action }),
      ...(params.entityType && { entityType: params.entityType }),
      ...(params.entityId && { entityId: params.entityId }),
      ...(params.userId && { userId: params.userId }),
    };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const auditService = new AuditService();

