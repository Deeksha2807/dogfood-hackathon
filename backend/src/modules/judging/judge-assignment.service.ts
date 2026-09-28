import crypto from "crypto";
import { prisma } from "../../config/database";
import { AssignmentStatus, EventRoleType, SubmissionStatus } from "@prisma/client";
import { CreateAssignmentInput, BatchAssignmentInput } from "./judge-assignment.schema";
import { auditService } from "../audit/audit.service";

export class JudgeAssignmentService {
  async createAssignment(
    eventId: string,
    input: CreateAssignmentInput,
    organizerUserId: string,
    ipAddress?: string
  ) {
    // 1. Verify judge has JUDGE role in event
    const judgeRole = await prisma.eventRole.findUnique({
      where: {
        eventId_userId_role: {
          eventId,
          userId: input.judgeId,
          role: EventRoleType.JUDGE,
        },
      },
    });

    if (!judgeRole) {
      const error: any = new Error("Selected user is not assigned the JUDGE role for this event.");
      error.statusCode = 400;
      error.code = "NOT_EVENT_JUDGE";
      throw error;
    }

    // 2. Verify submission belongs to this event
    const submission = await prisma.submission.findUnique({
      where: { id: input.submissionId },
      include: { team: true },
    });

    if (!submission || submission.eventId !== eventId) {
      const error: any = new Error("Submission not found in this event.");
      error.statusCode = 404;
      error.code = "SUBMISSION_NOT_FOUND";
      throw error;
    }

    if (submission.status === SubmissionStatus.DRAFT) {
      const error: any = new Error("Cannot assign judges to draft submissions. Submission must be submitted.");
      error.statusCode = 400;
      error.code = "SUBMISSION_IS_DRAFT";
      throw error;
    }

    // 3. Conflict of interest: Judge cannot evaluate their own team's submission
    const teamMembership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: submission.teamId,
          userId: input.judgeId,
        },
      },
    });

    if (teamMembership) {
      const error: any = new Error("Conflict of interest: Judge cannot evaluate a project submitted by their own team.");
      error.statusCode = 400;
      error.code = "CONFLICT_OF_INTEREST";
      throw error;
    }

    // 4. Duplicate assignment check
    const existing = await prisma.judgeAssignment.findUnique({
      where: {
        judgeId_submissionId: {
          judgeId: input.judgeId,
          submissionId: input.submissionId,
        },
      },
    });

    if (existing) {
      const error: any = new Error("This judge is already assigned to this submission.");
      error.statusCode = 409;
      error.code = "DUPLICATE_ASSIGNMENT";
      throw error;
    }

    const assignment = await prisma.judgeAssignment.create({
      data: {
        eventId,
        judgeId: input.judgeId,
        submissionId: input.submissionId,
        status: AssignmentStatus.ASSIGNED,
      },
      include: {
        judge: { select: { id: true, name: true, email: true } },
        submission: { select: { id: true, projectName: true, teamId: true } },
      },
    });

    await auditService.log({
      userId: organizerUserId,
      action: "JUDGE_ASSIGNMENT_CREATED",
      entityType: "JudgeAssignment",
      entityId: assignment.id,
      newValue: {
        eventId,
        judgeId: input.judgeId,
        submissionId: input.submissionId,
      },
      ipAddress,
    });

    return assignment;
  }

  async getAssignments(
    eventId: string,
    filters?: { judgeId?: string; submissionId?: string }
  ) {
    return prisma.judgeAssignment.findMany({
      where: {
        eventId,
        judgeId: filters?.judgeId,
        submissionId: filters?.submissionId,
      },
      include: {
        judge: { select: { id: true, name: true, email: true } },
        submission: { select: { id: true, projectName: true, teamId: true } },
        evaluation: {
          select: {
            id: true,
            rawTotalScore: true,
            isDraft: true,
            submittedAt: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });
  }

  /**
   * Deterministic batch assignment:
   * Distributes submissions to judges in a balanced, deterministic round-robin manner.
   */
  async createBatchAssignments(
    eventId: string,
    input: BatchAssignmentInput,
    organizerUserId: string,
    ipAddress?: string
  ) {
    // 1. Fetch eligible judges (sorted deterministically by ID)
    let judges: { userId: string }[] = [];
    if (input.judgeIds && input.judgeIds.length > 0) {
      const foundRoles = await prisma.eventRole.findMany({
        where: {
          eventId,
          userId: { in: input.judgeIds },
          role: EventRoleType.JUDGE,
        },
        select: { userId: true },
        orderBy: { userId: "asc" },
      });
      judges = foundRoles;
    } else {
      judges = await prisma.eventRole.findMany({
        where: {
          eventId,
          role: EventRoleType.JUDGE,
        },
        select: { userId: true },
        orderBy: { userId: "asc" },
      });
    }

    if (judges.length === 0) {
      const error: any = new Error("No eligible judges available for assignment in this event.");
      error.statusCode = 400;
      error.code = "NO_JUDGES_AVAILABLE";
      throw error;
    }

    // 2. Fetch eligible submissions (must not be draft, sorted deterministically by ID)
    let submissions: { id: string; teamId: string }[] = [];
    if (input.submissionIds && input.submissionIds.length > 0) {
      submissions = await prisma.submission.findMany({
        where: {
          id: { in: input.submissionIds },
          eventId,
          status: { not: SubmissionStatus.DRAFT },
        },
        select: { id: true, teamId: true },
        orderBy: { id: "asc" },
      });
    } else {
      submissions = await prisma.submission.findMany({
        where: {
          eventId,
          status: { not: SubmissionStatus.DRAFT },
        },
        select: { id: true, teamId: true },
        orderBy: { id: "asc" },
      });
    }

    if (submissions.length === 0) {
      const error: any = new Error("No eligible submitted projects found for assignment.");
      error.statusCode = 400;
      error.code = "NO_SUBMISSIONS_AVAILABLE";
      throw error;
    }

    // 3. Fetch existing team memberships for conflict checking
    const teamMembers = await prisma.teamMember.findMany({
      where: { eventId },
      select: { teamId: true, userId: true },
    });
    const teamMemberSet = new Set(teamMembers.map((tm) => `${tm.teamId}:${tm.userId}`));

    // 4. Fetch existing assignments to avoid duplicates
    const existingAssignments = await prisma.judgeAssignment.findMany({
      where: { eventId },
      select: { judgeId: true, submissionId: true },
    });
    const existingSet = new Set(
      existingAssignments.map((ea) => `${ea.judgeId}:${ea.submissionId}`)
    );

    const batchId = `batch_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
    const judgesPerSubmission = Math.min(input.judgesPerSubmission || 2, judges.length);

    const assignmentsToCreate: {
      eventId: string;
      judgeId: string;
      submissionId: string;
      batchId: string;
      status: AssignmentStatus;
    }[] = [];

    // Deterministic distribution
    for (let sIdx = 0; sIdx < submissions.length; sIdx++) {
      const sub = submissions[sIdx];
      let assignedCount = 0;
      let offset = 0;

      while (assignedCount < judgesPerSubmission && offset < judges.length) {
        const judgeIndex = (sIdx * judgesPerSubmission + offset) % judges.length;
        const judge = judges[judgeIndex];
        offset++;

        // Conflict check
        if (teamMemberSet.has(`${sub.teamId}:${judge.userId}`)) {
          continue;
        }

        // Duplicate check
        const key = `${judge.userId}:${sub.id}`;
        if (existingSet.has(key)) {
          continue;
        }

        assignmentsToCreate.push({
          eventId,
          judgeId: judge.userId,
          submissionId: sub.id,
          batchId,
          status: AssignmentStatus.ASSIGNED,
        });

        existingSet.add(key);
        assignedCount++;
      }
    }

    if (assignmentsToCreate.length === 0) {
      return {
        message: "No new assignments needed. All submissions are already fully assigned.",
        batchId,
        createdCount: 0,
        assignments: [],
      };
    }

    // Execute in transaction
    const created = await prisma.$transaction(
      assignmentsToCreate.map((item) =>
        prisma.judgeAssignment.create({
          data: item,
        })
      )
    );

    await auditService.log({
      userId: organizerUserId,
      action: "JUDGE_ASSIGNMENTS_BATCH_CREATED",
      entityType: "JudgeAssignmentBatch",
      entityId: batchId,
      newValue: {
        eventId,
        count: created.length,
        judgesCount: judges.length,
        submissionsCount: submissions.length,
      },
      ipAddress,
    });

    return {
      message: `Successfully created ${created.length} judge assignments.`,
      batchId,
      createdCount: created.length,
      assignments: created,
    };
  }
}

export const judgeAssignmentService = new JudgeAssignmentService();
