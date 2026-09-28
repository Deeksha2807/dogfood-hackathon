import { Router, Request, Response, NextFunction } from "express";
import { requireAuthenticatedUser } from "../../middleware/auth.middleware";
import { requireEventOrganizer, requireEventJudge } from "../../middleware/rbac.middleware";
import { judgeInvitationService } from "./judge-invitation.service";
import { createJudgeInvitationSchema } from "./judge-invitation.schema";
import { judgeAssignmentService } from "./judge-assignment.service";
import { createAssignmentSchema, batchAssignmentSchema } from "./judge-assignment.schema";
import { rubricService } from "./rubric.service";
import {
  createRubricSchema,
  updateRubricSchema,
  createCriterionSchema,
  updateCriterionSchema,
} from "./rubric.schema";
import { evaluationService } from "./evaluation.service";
import { createEvaluationSchema, updateEvaluationSchema } from "./evaluation.schema";
import { finalResultService } from "./final-result.service";

// ==========================================
// 1. JUDGE ROUTER (mounted at /:eventId/judges)
// ==========================================
export const judgeRouter = Router({ mergeParams: true });

// --- INVITATIONS ---
judgeRouter.post(
  "/invitations",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const parsed = createJudgeInvitationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid invitation data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const invitation = await judgeInvitationService.createInvitation(
        eventId,
        req.user!.id,
        parsed.data,
        req.ip
      );
      res.status(201).json({ invitation });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "INVITATION_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

judgeRouter.get(
  "/invitations",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const invitations = await judgeInvitationService.getInvitations(eventId);
      res.status(200).json({ invitations });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "INVITATION_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

judgeRouter.post(
  "/invitations/:invitationId/accept",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const invitationId = req.params.invitationId as string;
      const result = await judgeInvitationService.acceptInvitation(
        eventId,
        invitationId,
        req.user!,
        req.ip
      );
      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "INVITATION_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

judgeRouter.post(
  "/invitations/:invitationId/revoke",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const invitationId = req.params.invitationId as string;
      const result = await judgeInvitationService.revokeInvitation(
        eventId,
        invitationId,
        req.user!.id,
        req.ip
      );
      res.status(200).json({ invitation: result });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "INVITATION_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// --- ASSIGNMENTS ---
judgeRouter.post(
  "/assignments",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const parsed = createAssignmentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid assignment data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const assignment = await judgeAssignmentService.createAssignment(
        eventId,
        parsed.data,
        req.user!.id,
        req.ip
      );
      res.status(201).json({ assignment });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "ASSIGNMENT_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

judgeRouter.get(
  "/assignments",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const judgeId = typeof req.query.judgeId === "string" ? req.query.judgeId : undefined;
      const submissionId =
        typeof req.query.submissionId === "string" ? req.query.submissionId : undefined;

      const assignments = await judgeAssignmentService.getAssignments(eventId, {
        judgeId,
        submissionId,
      });
      res.status(200).json({ assignments });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "ASSIGNMENT_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

judgeRouter.post(
  "/assignments/batch",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const parsed = batchAssignmentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid batch assignment parameters.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await judgeAssignmentService.createBatchAssignments(
        eventId,
        parsed.data,
        req.user!.id,
        req.ip
      );
      res.status(201).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "ASSIGNMENT_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// ==========================================
// 2. RUBRIC ROUTER (mounted at /:eventId/rubrics)
// ==========================================
export const rubricRouter = Router({ mergeParams: true });

rubricRouter.post(
  "/",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const parsed = createRubricSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid rubric data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const rubric = await rubricService.createRubric(
        eventId,
        parsed.data,
        req.user!.id,
        req.ip
      );
      res.status(201).json({ rubric });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "RUBRIC_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

rubricRouter.get(
  "/",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const rubric = await rubricService.getRubric(eventId);
      res.status(200).json({ rubric });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "RUBRIC_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

rubricRouter.patch(
  "/:rubricId",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const rubricId = req.params.rubricId as string;
      const parsed = updateRubricSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid rubric update data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const rubric = await rubricService.updateRubric(
        eventId,
        rubricId,
        parsed.data,
        req.user!.id,
        req.ip
      );
      res.status(200).json({ rubric });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "RUBRIC_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

rubricRouter.post(
  "/:rubricId/criteria",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const rubricId = req.params.rubricId as string;
      const parsed = createCriterionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid criterion data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const criterion = await rubricService.addCriterion(
        eventId,
        rubricId,
        parsed.data,
        req.user!.id,
        req.ip
      );
      res.status(201).json({ criterion });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "RUBRIC_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

rubricRouter.patch(
  "/:rubricId/criteria/:criterionId",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const rubricId = req.params.rubricId as string;
      const criterionId = req.params.criterionId as string;
      const parsed = updateCriterionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid criterion update data.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const criterion = await rubricService.updateCriterion(
        eventId,
        rubricId,
        criterionId,
        parsed.data,
        req.user!.id,
        req.ip
      );
      res.status(200).json({ criterion });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "RUBRIC_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// ==========================================
// 3. JUDGING ROUTER (mounted at /:eventId/judging)
// ==========================================
export const judgingRouter = Router({ mergeParams: true });

// Judge gets their assigned submissions
judgingRouter.get(
  "/assignments",
  requireAuthenticatedUser,
  requireEventJudge,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const assignments = await evaluationService.getMyAssignments(eventId, req.user!.id);
      res.status(200).json({ assignments });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "JUDGING_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// Judge gets assignment details with rubric
judgingRouter.get(
  "/assignments/:assignmentId",
  requireAuthenticatedUser,
  requireEventJudge,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const assignmentId = req.params.assignmentId as string;
      const data = await evaluationService.getMyAssignmentById(
        eventId,
        assignmentId,
        req.user!.id
      );
      res.status(200).json(data);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "JUDGING_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// Judge submits evaluation
judgingRouter.post(
  "/assignments/:assignmentId/evaluation",
  requireAuthenticatedUser,
  requireEventJudge,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const assignmentId = req.params.assignmentId as string;
      const parsed = createEvaluationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid evaluation submission.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const evaluation = await evaluationService.submitEvaluation(
        eventId,
        assignmentId,
        req.user!.id,
        parsed.data,
        req.ip
      );
      res.status(201).json({ evaluation });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "JUDGING_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// Judge updates their evaluation
judgingRouter.patch(
  "/evaluations/:evaluationId",
  requireAuthenticatedUser,
  requireEventJudge,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const evaluationId = req.params.evaluationId as string;
      const parsed = updateEvaluationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Invalid evaluation update.",
          details: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const evaluation = await evaluationService.updateEvaluation(
        eventId,
        evaluationId,
        req.user!.id,
        parsed.data,
        req.ip
      );
      res.status(200).json({ evaluation });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "JUDGING_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// Judge personal progress
judgingRouter.get(
  "/my-progress",
  requireAuthenticatedUser,
  requireEventJudge,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const progress = await evaluationService.getJudgeProgress(eventId, req.user!.id);
      res.status(200).json({ progress });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "JUDGING_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// Organizer overall progress
judgingRouter.get(
  "/progress",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const progress = await evaluationService.getEventOverallProgress(eventId);
      res.status(200).json({ progress });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "JUDGING_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// Organizer calculates final results
judgingRouter.post(
  "/final-results/calculate",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const results = await finalResultService.calculateFinalResults(
        eventId,
        req.user!.id,
        req.ip
      );
      res.status(200).json({ results });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "FINAL_RESULTS_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// Organizer publishes final results
judgingRouter.post(
  "/final-results/publish",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const result = await finalResultService.publishFinalResults(
        eventId,
        req.user!.id,
        req.ip
      );
      res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "FINAL_RESULTS_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// Get final results (Organizer anytime, public/participants when published)
judgingRouter.get(
  "/final-results",
  requireAuthenticatedUser,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      const results = await finalResultService.getFinalResults(eventId, req.user!.id);
      res.status(200).json({ results });
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "FINAL_RESULTS_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);

// Organizer CSV export of results
judgingRouter.get(
  "/results.csv",
  requireAuthenticatedUser,
  requireEventOrganizer,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const eventId = req.params.eventId as string;
      await finalResultService.exportResultsCsv(eventId, res);
    } catch (error: any) {
      if (error.statusCode) {
        res.status(error.statusCode).json({
          error: error.code || "EXPORT_ERROR",
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }
);
