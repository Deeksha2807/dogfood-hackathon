import { prisma } from "../../config/database";
import { AssignmentStatus, SubmissionStatus } from "@prisma/client";
import { CreateEvaluationInput, UpdateEvaluationInput } from "./evaluation.schema";
import { auditService } from "../audit/audit.service";

export class EvaluationService {
  /**
   * Judge gets their own assignments for an event.
   */
  async getMyAssignments(eventId: string, judgeUserId: string) {
    return prisma.judgeAssignment.findMany({
      where: {
        eventId,
        judgeId: judgeUserId,
      },
      include: {
        submission: {
          select: {
            id: true,
            projectName: true,
            tagline: true,
            description: true,
            repoUrl: true,
            demoUrl: true,
            videoUrl: true,
            trackId: true,
            status: true,
            track: { select: { id: true, name: true } },
          },
        },
        evaluation: {
          include: {
            scoreItems: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });
  }

  /**
   * Judge gets a specific assignment details along with the required rubric.
   */
  async getMyAssignmentById(eventId: string, assignmentId: string, judgeUserId: string) {
    const assignment = await prisma.judgeAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        submission: {
          include: {
            track: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        evaluation: {
          include: {
            scoreItems: true,
          },
        },
      },
    });

    if (!assignment || assignment.eventId !== eventId) {
      const error: any = new Error("Assignment not found in this event.");
      error.statusCode = 404;
      error.code = "ASSIGNMENT_NOT_FOUND";
      throw error;
    }

    if (assignment.judgeId !== judgeUserId) {
      const error: any = new Error("Access denied: You are not assigned to this submission.");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    const rubric = await prisma.rubric.findUnique({
      where: { eventId },
      include: {
        criteria: {
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    return {
      assignment,
      rubric,
    };
  }

  /**
   * Judge submits an evaluation for their assigned submission.
   */
  async submitEvaluation(
    eventId: string,
    assignmentId: string,
    judgeUserId: string,
    input: CreateEvaluationInput,
    ipAddress?: string
  ) {
    const assignment = await prisma.judgeAssignment.findUnique({
      where: { id: assignmentId },
      include: { submission: true },
    });

    if (!assignment || assignment.eventId !== eventId) {
      const error: any = new Error("Assignment not found in this event.");
      error.statusCode = 404;
      error.code = "ASSIGNMENT_NOT_FOUND";
      throw error;
    }

    if (assignment.judgeId !== judgeUserId) {
      const error: any = new Error("Access denied: You are not authorized to evaluate this assignment.");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    // Check if evaluation already exists
    const existingEvaluation = await prisma.evaluation.findUnique({
      where: { assignmentId },
    });

    if (existingEvaluation) {
      const error: any = new Error("An evaluation has already been submitted for this assignment. Use update to modify.");
      error.statusCode = 409;
      error.code = "EVALUATION_ALREADY_EXISTS";
      throw error;
    }

    // Fetch rubric for criterion validation
    const rubric = await prisma.rubric.findUnique({
      where: { eventId },
      include: { criteria: true },
    });

    if (!rubric || rubric.criteria.length === 0) {
      const error: any = new Error("Event rubric is not configured.");
      error.statusCode = 400;
      error.code = "RUBRIC_NOT_CONFIGURED";
      throw error;
    }

    // Validate that every criterion in rubric is scored
    const rubricCriteriaMap = new Map(rubric.criteria.map((c) => [c.id, c]));
    const submittedCriterionIds = new Set(input.scores.map((s) => s.criterionId));

    for (const criterion of rubric.criteria) {
      if (!submittedCriterionIds.has(criterion.id)) {
        const error: any = new Error(`Missing score for criterion: '${criterion.name}'. All criteria must be scored.`);
        error.statusCode = 400;
        error.code = "INCOMPLETE_EVALUATION";
        throw error;
      }
    }

    // Validate score ranges and calculate raw total score
    let calculatedRawTotal = 0;
    const scoreItemsData: {
      criterionId: string;
      score: number;
      comment?: string;
      criterionNameSnapshot: string;
      weightSnapshot: number;
      maxPointsSnapshot: number;
    }[] = [];

    for (const scoreInput of input.scores) {
      const criterion = rubricCriteriaMap.get(scoreInput.criterionId);
      if (!criterion) {
        const error: any = new Error(`Criterion ID '${scoreInput.criterionId}' does not belong to this event's rubric.`);
        error.statusCode = 400;
        error.code = "INVALID_CRITERION";
        throw error;
      }

      const maxPointsNum = Number(criterion.maxPoints);
      if (scoreInput.score < 0 || scoreInput.score > maxPointsNum) {
        const error: any = new Error(
          `Score for '${criterion.name}' must be between 0 and ${maxPointsNum}. Received: ${scoreInput.score}.`
        );
        error.statusCode = 400;
        error.code = "SCORE_OUT_OF_RANGE";
        throw error;
      }

      // Weighted score contribution normalized to 0-100 scale:
      // (score / maxPoints) * (weightBasisPoints / 10000) * 100
      const weightFraction = criterion.weightBasisPoints / 10000;
      const normalizedCriterionScore = (scoreInput.score / maxPointsNum) * 100;
      calculatedRawTotal += normalizedCriterionScore * weightFraction;

      scoreItemsData.push({
        criterionId: criterion.id,
        score: scoreInput.score,
        comment: scoreInput.comment,
        criterionNameSnapshot: criterion.name,
        weightSnapshot: criterion.weightBasisPoints,
        maxPointsSnapshot: maxPointsNum,
      });
    }

    const roundedRawTotal = Math.round(calculatedRawTotal * 10000) / 10000;

    return prisma.$transaction(async (tx) => {
      const evaluation = await tx.evaluation.create({
        data: {
          assignmentId,
          submissionId: assignment.submissionId,
          judgeId: judgeUserId,
          rawTotalScore: roundedRawTotal,
          feedback: input.feedback,
          isDraft: input.isDraft ?? false,
          scoreItems: {
            create: scoreItemsData,
          },
        },
        include: {
          scoreItems: true,
        },
      });

      // Update assignment status
      await tx.judgeAssignment.update({
        where: { id: assignmentId },
        data: {
          status: input.isDraft ? AssignmentStatus.IN_PROGRESS : AssignmentStatus.COMPLETED,
        },
      });

      // Update submission status to UNDER_REVIEW if not already
      if (!input.isDraft && assignment.submission.status === SubmissionStatus.SUBMITTED) {
        await tx.submission.update({
          where: { id: assignment.submissionId },
          data: { status: SubmissionStatus.UNDER_REVIEW },
        });
      }

      await auditService.log({
        userId: judgeUserId,
        action: "EVALUATION_SUBMITTED",
        entityType: "Evaluation",
        entityId: evaluation.id,
        newValue: {
          assignmentId,
          submissionId: assignment.submissionId,
          rawTotalScore: roundedRawTotal,
          isDraft: input.isDraft,
        },
        ipAddress,
      });

      return evaluation;
    });
  }

  /**
   * Judge updates an existing evaluation (before results are published).
   */
  async updateEvaluation(
    eventId: string,
    evaluationId: string,
    judgeUserId: string,
    input: UpdateEvaluationInput,
    ipAddress?: string
  ) {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        assignment: {
          include: {
            event: true,
          },
        },
        scoreItems: true,
      },
    });

    if (!evaluation || evaluation.assignment.eventId !== eventId) {
      const error: any = new Error("Evaluation not found in this event.");
      error.statusCode = 404;
      error.code = "EVALUATION_NOT_FOUND";
      throw error;
    }

    if (evaluation.judgeId !== judgeUserId) {
      const error: any = new Error("Access denied: You can only edit your own evaluation.");
      error.statusCode = 403;
      error.code = "FORBIDDEN";
      throw error;
    }

    if (evaluation.assignment.event.resultsPublished) {
      const error: any = new Error("Cannot modify evaluation: Final results have already been published.");
      error.statusCode = 400;
      error.code = "RESULTS_ALREADY_PUBLISHED";
      throw error;
    }

    // If new scores are provided, revalidate and recompute
    if (input.scores && input.scores.length > 0) {
      const rubric = await prisma.rubric.findUnique({
        where: { eventId },
        include: { criteria: true },
      });

      if (!rubric) {
        const error: any = new Error("Event rubric is not configured.");
        error.statusCode = 400;
        error.code = "RUBRIC_NOT_CONFIGURED";
        throw error;
      }

      const rubricCriteriaMap = new Map(rubric.criteria.map((c) => [c.id, c]));
      let calculatedRawTotal = 0;
      const scoreItemsData: {
        criterionId: string;
        score: number;
        comment?: string;
        criterionNameSnapshot: string;
        weightSnapshot: number;
        maxPointsSnapshot: number;
      }[] = [];

      for (const scoreInput of input.scores) {
        const criterion = rubricCriteriaMap.get(scoreInput.criterionId);
        if (!criterion) {
          const error: any = new Error(`Invalid criterion ID: '${scoreInput.criterionId}'.`);
          error.statusCode = 400;
          error.code = "INVALID_CRITERION";
          throw error;
        }

        const maxPointsNum = Number(criterion.maxPoints);
        if (scoreInput.score < 0 || scoreInput.score > maxPointsNum) {
          const error: any = new Error(
            `Score for '${criterion.name}' must be between 0 and ${maxPointsNum}.`
          );
          error.statusCode = 400;
          error.code = "SCORE_OUT_OF_RANGE";
          throw error;
        }

        const weightFraction = criterion.weightBasisPoints / 10000;
        const normalizedCriterionScore = (scoreInput.score / maxPointsNum) * 100;
        calculatedRawTotal += normalizedCriterionScore * weightFraction;

        scoreItemsData.push({
          criterionId: criterion.id,
          score: scoreInput.score,
          comment: scoreInput.comment,
          criterionNameSnapshot: criterion.name,
          weightSnapshot: criterion.weightBasisPoints,
          maxPointsSnapshot: maxPointsNum,
        });
      }

      const roundedRawTotal = Math.round(calculatedRawTotal * 10000) / 10000;

      return prisma.$transaction(async (tx) => {
        // Delete old score items and recreate with updated snapshots
        await tx.evaluationScoreItem.deleteMany({
          where: { evaluationId },
        });

        const updated = await tx.evaluation.update({
          where: { id: evaluationId },
          data: {
            rawTotalScore: roundedRawTotal,
            feedback: input.feedback !== undefined ? input.feedback : evaluation.feedback,
            isDraft: input.isDraft !== undefined ? input.isDraft : evaluation.isDraft,
            scoreItems: {
              create: scoreItemsData,
            },
          },
          include: {
            scoreItems: true,
          },
        });

        if (input.isDraft !== undefined) {
          await tx.judgeAssignment.update({
            where: { id: evaluation.assignmentId },
            data: {
              status: input.isDraft ? AssignmentStatus.IN_PROGRESS : AssignmentStatus.COMPLETED,
            },
          });
        }

        await auditService.log({
          userId: judgeUserId,
          action: "EVALUATION_UPDATED",
          entityType: "Evaluation",
          entityId: evaluationId,
          oldValue: { rawTotalScore: Number(evaluation.rawTotalScore), isDraft: evaluation.isDraft },
          newValue: { rawTotalScore: roundedRawTotal, isDraft: updated.isDraft },
          ipAddress,
        });

        return updated;
      });
    } else {
      // Just updating feedback or draft status
      const updated = await prisma.evaluation.update({
        where: { id: evaluationId },
        data: {
          feedback: input.feedback !== undefined ? input.feedback : evaluation.feedback,
          isDraft: input.isDraft !== undefined ? input.isDraft : evaluation.isDraft,
        },
        include: {
          scoreItems: true,
        },
      });

      if (input.isDraft !== undefined) {
        await prisma.judgeAssignment.update({
          where: { id: evaluation.assignmentId },
          data: {
            status: input.isDraft ? AssignmentStatus.IN_PROGRESS : AssignmentStatus.COMPLETED,
          },
        });
      }

      await auditService.log({
        userId: judgeUserId,
        action: "EVALUATION_UPDATED",
        entityType: "Evaluation",
        entityId: evaluationId,
        oldValue: { isDraft: evaluation.isDraft },
        newValue: { isDraft: updated.isDraft },
        ipAddress,
      });

      return updated;
    }
  }

  /**
   * Judge progress endpoint:
   * Returns assigned, completed, in-progress, remaining counts and completion percentage.
   */
  async getJudgeProgress(eventId: string, judgeUserId: string) {
    const assignments = await prisma.judgeAssignment.findMany({
      where: { eventId, judgeId: judgeUserId },
      select: { status: true },
    });

    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === AssignmentStatus.COMPLETED).length;
    const inProgress = assignments.filter((a) => a.status === AssignmentStatus.IN_PROGRESS).length;
    const remaining = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 10000) / 100 : 0;

    return {
      judgeId: judgeUserId,
      totalAssigned: total,
      completed,
      inProgress,
      remaining,
      completionPercentage: percentage,
    };
  }

  /**
   * Organizer progress endpoint:
   * Returns overall judging progress plus per-judge breakdown.
   */
  async getEventOverallProgress(eventId: string) {
    const assignments = await prisma.judgeAssignment.findMany({
      where: { eventId },
      include: {
        judge: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const totalAssignments = assignments.length;
    const completedAssignments = assignments.filter(
      (a) => a.status === AssignmentStatus.COMPLETED
    ).length;
    const overallPercentage =
      totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 10000) / 100
        : 0;

    // Group by judge
    const judgeMap = new Map<
      string,
      {
        judgeId: string;
        judgeName: string;
        judgeEmail: string;
        assigned: number;
        completed: number;
        inProgress: number;
      }
    >();

    for (const a of assignments) {
      let entry = judgeMap.get(a.judgeId);
      if (!entry) {
        entry = {
          judgeId: a.judgeId,
          judgeName: a.judge.name,
          judgeEmail: a.judge.email,
          assigned: 0,
          completed: 0,
          inProgress: 0,
        };
        judgeMap.set(a.judgeId, entry);
      }
      entry.assigned++;
      if (a.status === AssignmentStatus.COMPLETED) {
        entry.completed++;
      } else if (a.status === AssignmentStatus.IN_PROGRESS) {
        entry.inProgress++;
      }
    }

    const judgesProgress = Array.from(judgeMap.values()).map((j) => ({
      ...j,
      remaining: j.assigned - j.completed,
      completionPercentage:
        j.assigned > 0 ? Math.round((j.completed / j.assigned) * 10000) / 100 : 0,
    }));

    return {
      eventId,
      totalAssignments,
      completedAssignments,
      remainingAssignments: totalAssignments - completedAssignments,
      overallCompletionPercentage: overallPercentage,
      judges: judgesProgress,
    };
  }
}

export const evaluationService = new EvaluationService();
