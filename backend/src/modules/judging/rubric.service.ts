import { prisma } from "../../config/database";
import {
  CreateRubricInput,
  UpdateRubricInput,
  CreateCriterionInput,
  UpdateCriterionInput,
} from "./rubric.schema";
import { auditService } from "../audit/audit.service";

export class RubricService {
  async createRubric(
    eventId: string,
    input: CreateRubricInput,
    organizerUserId: string,
    ipAddress?: string
  ) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    const existing = await prisma.rubric.findUnique({
      where: { eventId },
    });

    if (existing) {
      const error: any = new Error("A rubric already exists for this event.");
      error.statusCode = 409;
      error.code = "RUBRIC_ALREADY_EXISTS";
      throw error;
    }

    // If criteria are provided at creation, validate them
    if (input.criteria && input.criteria.length > 0) {
      const totalWeight = input.criteria.reduce((acc, c) => acc + c.weightBasisPoints, 0);
      if (totalWeight > 10000) {
        const error: any = new Error("Total criteria weights cannot exceed 10000 basis points (100%).");
        error.statusCode = 400;
        error.code = "INVALID_RUBRIC_WEIGHTS";
        throw error;
      }
    }

    const rubric = await prisma.rubric.create({
      data: {
        eventId,
        name: input.name,
        criteria: input.criteria && input.criteria.length > 0 ? {
          create: input.criteria.map((c, index) => ({
            name: c.name,
            description: c.description,
            weightBasisPoints: c.weightBasisPoints,
            maxPoints: c.maxPoints,
            orderIndex: c.orderIndex ?? index,
          })),
        } : undefined,
      },
      include: {
        criteria: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    await auditService.log({
      userId: organizerUserId,
      action: "RUBRIC_CREATED",
      entityType: "Rubric",
      entityId: rubric.id,
      newValue: {
        eventId,
        name: rubric.name,
        criteriaCount: rubric.criteria.length,
      },
      ipAddress,
    });

    return rubric;
  }

  async getRubric(eventId: string) {
    const rubric = await prisma.rubric.findUnique({
      where: { eventId },
      include: {
        criteria: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!rubric) {
      const error: any = new Error("Rubric not configured for this event.");
      error.statusCode = 404;
      error.code = "RUBRIC_NOT_FOUND";
      throw error;
    }

    return rubric;
  }

  async updateRubric(
    eventId: string,
    rubricId: string,
    input: UpdateRubricInput,
    organizerUserId: string,
    ipAddress?: string
  ) {
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
      include: { criteria: true },
    });

    if (!rubric || rubric.eventId !== eventId) {
      const error: any = new Error("Rubric not found in this event.");
      error.statusCode = 404;
      error.code = "RUBRIC_NOT_FOUND";
      throw error;
    }

    // If attempting to lock, validate criteria weights sum to 10000
    if (input.isLocked === true) {
      if (rubric.criteria.length === 0) {
        const error: any = new Error("Cannot lock rubric without any criteria.");
        error.statusCode = 400;
        error.code = "RUBRIC_EMPTY";
        throw error;
      }
      const totalWeight = rubric.criteria.reduce((acc, c) => acc + c.weightBasisPoints, 0);
      if (totalWeight !== 10000) {
        const error: any = new Error(`Cannot lock rubric: Criteria weights must sum exactly to 10000 basis points (current: ${totalWeight}).`);
        error.statusCode = 400;
        error.code = "INVALID_RUBRIC_TOTAL_WEIGHT";
        throw error;
      }
    }

    const updated = await prisma.rubric.update({
      where: { id: rubricId },
      data: {
        name: input.name,
        isLocked: input.isLocked,
      },
      include: {
        criteria: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    await auditService.log({
      userId: organizerUserId,
      action: "RUBRIC_UPDATED",
      entityType: "Rubric",
      entityId: rubricId,
      oldValue: { name: rubric.name, isLocked: rubric.isLocked },
      newValue: { name: updated.name, isLocked: updated.isLocked },
      ipAddress,
    });

    return updated;
  }

  async addCriterion(
    eventId: string,
    rubricId: string,
    input: CreateCriterionInput,
    organizerUserId: string,
    ipAddress?: string
  ) {
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
      include: { criteria: true },
    });

    if (!rubric || rubric.eventId !== eventId) {
      const error: any = new Error("Rubric not found in this event.");
      error.statusCode = 404;
      error.code = "RUBRIC_NOT_FOUND";
      throw error;
    }

    if (rubric.isLocked) {
      const error: any = new Error("Cannot add criteria: Rubric is locked.");
      error.statusCode = 400;
      error.code = "RUBRIC_LOCKED";
      throw error;
    }

    const currentTotalWeight = rubric.criteria.reduce((acc, c) => acc + c.weightBasisPoints, 0);
    if (currentTotalWeight + input.weightBasisPoints > 10000) {
      const error: any = new Error(`Total criteria weights cannot exceed 10000 basis points. Current sum is ${currentTotalWeight}, adding ${input.weightBasisPoints} exceeds 10000.`);
      error.statusCode = 400;
      error.code = "INVALID_RUBRIC_WEIGHTS";
      throw error;
    }

    const orderIndex = input.orderIndex ?? rubric.criteria.length;

    const criterion = await prisma.rubricCriterion.create({
      data: {
        rubricId,
        name: input.name,
        description: input.description,
        weightBasisPoints: input.weightBasisPoints,
        maxPoints: input.maxPoints,
        orderIndex,
      },
    });

    await auditService.log({
      userId: organizerUserId,
      action: "RUBRIC_CRITERION_ADDED",
      entityType: "RubricCriterion",
      entityId: criterion.id,
      newValue: {
        rubricId,
        name: criterion.name,
        weightBasisPoints: criterion.weightBasisPoints,
        maxPoints: criterion.maxPoints,
      },
      ipAddress,
    });

    return criterion;
  }

  async updateCriterion(
    eventId: string,
    rubricId: string,
    criterionId: string,
    input: UpdateCriterionInput,
    organizerUserId: string,
    ipAddress?: string
  ) {
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
      include: { criteria: true },
    });

    if (!rubric || rubric.eventId !== eventId) {
      const error: any = new Error("Rubric not found in this event.");
      error.statusCode = 404;
      error.code = "RUBRIC_NOT_FOUND";
      throw error;
    }

    if (rubric.isLocked) {
      const error: any = new Error("Cannot modify criteria: Rubric is locked.");
      error.statusCode = 400;
      error.code = "RUBRIC_LOCKED";
      throw error;
    }

    const existingCriterion = rubric.criteria.find((c) => c.id === criterionId);
    if (!existingCriterion) {
      const error: any = new Error("Criterion not found in this rubric.");
      error.statusCode = 404;
      error.code = "CRITERION_NOT_FOUND";
      throw error;
    }

    if (input.weightBasisPoints !== undefined) {
      const otherCriteriaWeight = rubric.criteria
        .filter((c) => c.id !== criterionId)
        .reduce((acc, c) => acc + c.weightBasisPoints, 0);

      if (otherCriteriaWeight + input.weightBasisPoints > 10000) {
        const error: any = new Error("Total criteria weights cannot exceed 10000 basis points.");
        error.statusCode = 400;
        error.code = "INVALID_RUBRIC_WEIGHTS";
        throw error;
      }
    }

    const updated = await prisma.rubricCriterion.update({
      where: { id: criterionId },
      data: {
        name: input.name,
        description: input.description,
        weightBasisPoints: input.weightBasisPoints,
        maxPoints: input.maxPoints,
        orderIndex: input.orderIndex,
      },
    });

    await auditService.log({
      userId: organizerUserId,
      action: "RUBRIC_CRITERION_UPDATED",
      entityType: "RubricCriterion",
      entityId: criterionId,
      oldValue: {
        name: existingCriterion.name,
        weightBasisPoints: existingCriterion.weightBasisPoints,
        maxPoints: existingCriterion.maxPoints,
      },
      newValue: {
        name: updated.name,
        weightBasisPoints: updated.weightBasisPoints,
        maxPoints: updated.maxPoints,
      },
      ipAddress,
    });

    return updated;
  }
}

export const rubricService = new RubricService();
