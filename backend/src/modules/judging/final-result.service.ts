import { Response } from "express";
import { prisma } from "../../config/database";
import { normalizationService, RawJudgeEvaluation } from "./normalization.service";
import { auditService } from "../audit/audit.service";
import { EventRoleType } from "@prisma/client";

export class FinalResultService {
  /**
   * Calculates final results and cross-judge normalization for an event.
   */
  async calculateFinalResults(
    eventId: string,
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

    // 1. Fetch all completed, non-draft evaluations for this event
    const evaluations = await prisma.evaluation.findMany({
      where: {
        isDraft: false,
        assignment: {
          eventId,
        },
      },
      select: {
        id: true,
        judgeId: true,
        submissionId: true,
        rawTotalScore: true,
      },
    });

    if (evaluations.length === 0) {
      const error: any = new Error("Cannot calculate final results: No completed evaluations found.");
      error.statusCode = 400;
      error.code = "NO_COMPLETED_EVALUATIONS";
      throw error;
    }

    // 2. Prepare raw evaluation inputs for normalization
    const rawInputs: RawJudgeEvaluation[] = evaluations.map((e) => ({
      id: e.id,
      judgeId: e.judgeId,
      submissionId: e.submissionId,
      rawTotalScore: Number(e.rawTotalScore),
    }));

    // 3. Run cross-judge score normalization service
    const { submissionAggregates } = normalizationService.normalizeEvaluations(rawInputs);

    // 4. Fetch submission details (track, team) for all evaluated submissions
    const evaluatedSubmissionIds = Array.from(submissionAggregates.keys());
    const submissions = await prisma.submission.findMany({
      where: {
        id: { in: evaluatedSubmissionIds },
        eventId,
      },
      include: {
        track: true,
        team: true,
      },
    });

    const submissionMap = new Map(submissions.map((s) => [s.id, s]));

    // 5. Combine and sort deterministically
    interface ScoredSubmission {
      submissionId: string;
      trackId: string;
      rawAverageScore: number;
      normalizedScore: number;
      finalCompositeScore: number;
      evaluationsCount: number;
    }

    const scoredList: ScoredSubmission[] = [];
    for (const [subId, agg] of submissionAggregates.entries()) {
      const sub = submissionMap.get(subId);
      if (!sub) continue;

      // In T2 (before T3 community voting), composite score is equal to normalized score
      scoredList.push({
        submissionId: subId,
        trackId: sub.trackId,
        rawAverageScore: agg.rawAverageScore,
        normalizedScore: agg.normalizedScore,
        finalCompositeScore: agg.normalizedScore,
        evaluationsCount: agg.evaluationsCount,
      });
    }

    // Deterministic row ordering:
    // Sort primarily by finalCompositeScore DESC.
    // Secondary sort by submissionId ASC is purely for reproducible database rows/CSV ordering,
    // and MUST NOT be used to break ties in rank determination.
    scoredList.sort((a, b) => {
      if (b.finalCompositeScore !== a.finalCompositeScore) {
        return b.finalCompositeScore - a.finalCompositeScore;
      }
      return a.submissionId.localeCompare(b.submissionId);
    });

    // 6. Assign overall ranks and track ranks, detecting ties without creating arbitrary winners
    // When submissions have identical finalCompositeScore, they share the exact same rank.
    const trackCounters = new Map<string, { lastScore: number; lastRank: number; count: number }>();
    let currentOverallRank = 1;

    const finalResultsToUpsert = scoredList.map((item, index) => {
      const isTiedWithPrev =
        index > 0 && scoredList[index - 1].finalCompositeScore === item.finalCompositeScore;
      const isTiedWithNext =
        index < scoredList.length - 1 &&
        scoredList[index + 1].finalCompositeScore === item.finalCompositeScore;
      const isTied = isTiedWithPrev || isTiedWithNext;

      let overallRank: number;
      if (isTiedWithPrev) {
        // Tied with previous item: share the previous item's rank
        overallRank = currentOverallRank;
      } else {
        // New distinct score: standard competition rank (1-based position in list: index + 1)
        currentOverallRank = index + 1;
        overallRank = currentOverallRank;
      }

      // Track ranking preserving ties within track
      let trackInfo = trackCounters.get(item.trackId);
      if (!trackInfo) {
        trackInfo = { lastScore: item.finalCompositeScore, lastRank: 1, count: 1 };
        trackCounters.set(item.trackId, trackInfo);
      } else {
        trackInfo.count++;
        if (item.finalCompositeScore === trackInfo.lastScore) {
          // Tied in track: share lastRank
        } else {
          trackInfo.lastRank = trackInfo.count;
          trackInfo.lastScore = item.finalCompositeScore;
        }
      }
      const trackRank = trackInfo.lastRank;

      let tieBreakerReason: string | null = null;
      if (isTied) {
        tieBreakerReason = `Tied at composite score ${item.finalCompositeScore.toFixed(4)} (unresolved tie; no official tie-breaker specified)`;
      }

      return {
        eventId,
        submissionId: item.submissionId,
        rawAverageScore: item.rawAverageScore,
        normalizedScore: item.normalizedScore,
        finalCompositeScore: item.finalCompositeScore,
        rank: overallRank,
        trackRank,
        tieBreakerReason,
      };
    });

    // 7. Persist final results
    const results = await prisma.$transaction(
      finalResultsToUpsert.map((res) =>
        prisma.finalResult.upsert({
          where: { submissionId: res.submissionId },
          create: {
            eventId: res.eventId,
            submissionId: res.submissionId,
            rawAverageScore: res.rawAverageScore,
            normalizedScore: res.normalizedScore,
            finalCompositeScore: res.finalCompositeScore,
            rank: res.rank,
            trackRank: res.trackRank,
            tieBreakerReason: res.tieBreakerReason,
            isPublished: false,
          },
          update: {
            rawAverageScore: res.rawAverageScore,
            normalizedScore: res.normalizedScore,
            finalCompositeScore: res.finalCompositeScore,
            rank: res.rank,
            trackRank: res.trackRank,
            tieBreakerReason: res.tieBreakerReason,
          },
        })
      )
    );

    await auditService.log({
      userId: organizerUserId,
      action: "FINAL_RESULTS_CALCULATED",
      entityType: "FinalResult",
      entityId: eventId,
      newValue: {
        evaluatedCount: results.length,
      },
      ipAddress,
    });

    return results;
  }

  /**
   * Publishes the final results so participants and the public can view them.
   */
  async publishFinalResults(
    eventId: string,
    organizerUserId: string,
    ipAddress?: string
  ) {
    const resultsCount = await prisma.finalResult.count({
      where: { eventId },
    });

    if (resultsCount === 0) {
      const error: any = new Error("Cannot publish results: Final results have not been calculated yet.");
      error.statusCode = 400;
      error.code = "RESULTS_NOT_CALCULATED";
      throw error;
    }

    const now = new Date();
    await prisma.$transaction([
      prisma.finalResult.updateMany({
        where: { eventId },
        data: {
          isPublished: true,
          publishedAt: now,
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: {
          resultsPublished: true,
        },
      }),
    ]);

    await auditService.log({
      userId: organizerUserId,
      action: "FINAL_RESULTS_PUBLISHED",
      entityType: "Event",
      entityId: eventId,
      ipAddress,
    });

    return {
      message: "Final results published successfully.",
      publishedAt: now,
      resultsCount,
    };
  }

  /**
   * Retrieves final results with access control.
   */
  async getFinalResults(eventId: string, userId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      const error: any = new Error("Event not found.");
      error.statusCode = 404;
      error.code = "EVENT_NOT_FOUND";
      throw error;
    }

    // Check if user is organizer or super admin
    const organizerRole = await prisma.eventRole.findUnique({
      where: {
        eventId_userId_role: {
          eventId,
          userId,
          role: EventRoleType.ORGANIZER,
        },
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isSuperAdmin = user?.globalRole === "SUPER_ADMIN";

    if (!organizerRole && !isSuperAdmin && !event.resultsPublished) {
      const error: any = new Error("Final results have not been published yet.");
      error.statusCode = 403;
      error.code = "RESULTS_NOT_PUBLISHED";
      throw error;
    }


    return prisma.finalResult.findMany({
      where: { eventId },
      include: {
        submission: {
          select: {
            id: true,
            projectName: true,
            tagline: true,
            track: { select: { id: true, name: true } },
            team: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { rank: "asc" },
    });
  }

  /**
   * Generates and streams a CSV export of final results (Organizer only).
   */
  async exportResultsCsv(eventId: string, res: Response) {
    const results = await prisma.finalResult.findMany({
      where: { eventId },
      include: {
        submission: {
          include: {
            track: true,
            team: true,
            assignments: {
              where: { status: "COMPLETED" },
            },
          },
        },
      },
      orderBy: { rank: "asc" },
    });

    // Helper to safely escape CSV fields
    const escapeCsv = (field: any): string => {
      if (field === null || field === undefined) return "";
      const str = String(field);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      "Rank",
      "Track Rank",
      "Project Name",
      "Team Name",
      "Track",
      "Raw Average Score",
      "Normalized Score",
      "Final Composite Score",
      "Completed Evaluations Count",
      "Tie Breaker Reason",
    ];

    const rows = results.map((r) => [
      escapeCsv(r.rank),
      escapeCsv(r.trackRank ?? ""),
      escapeCsv(r.submission.projectName),
      escapeCsv(r.submission.team.name),
      escapeCsv(r.submission.track.name),
      escapeCsv(Number(r.rawAverageScore).toFixed(4)),
      escapeCsv(Number(r.normalizedScore).toFixed(4)),
      escapeCsv(Number(r.finalCompositeScore).toFixed(4)),
      escapeCsv(r.submission.assignments.length),
      escapeCsv(r.tieBreakerReason || "None"),
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="event-${eventId}-results.csv"`
    );
    res.status(200).send(csvContent);
  }
}

export const finalResultService = new FinalResultService();
