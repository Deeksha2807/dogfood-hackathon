import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { EventRoleType, SubmissionStatus } from "@prisma/client";
import { normalizationService } from "../src/modules/judging/normalization.service";

describe("T2 Judging Engine", () => {
  const ts = Date.now();

  let organizerId: string;
  let organizerEmail: string;
  let organizerCookie: string;

  let judge1Id: string;
  let judge1Email: string;
  let judge1Cookie: string;

  let judge2Id: string;
  let judge2Email: string;
  let judge2Cookie: string;

  let participant1Id: string;
  let participant1Email: string;
  let participant1Cookie: string;

  let participant2Id: string;
  let participant2Email: string;
  let participant2Cookie: string;

  let event1Id: string;
  let event2Id: string;
  let track1Id: string;

  let team1Id: string;
  let team2Id: string;
  let submission1Id: string;
  let submission2Id: string;

  let rubricId: string;
  let criterion1Id: string;
  let criterion2Id: string;

  let judge1AssignmentSub1Id: string;
  let judge2AssignmentSub1Id: string;
  let judge1AssignmentSub2Id: string;
  let judge2AssignmentSub2Id: string;

  let evaluation1Id: string;

  // Helper to create users with session cookies
  async function helperCreateUser(name: string, email: string) {
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({
        name,
        email,
        password: "Password123!",
      });

    expect(regRes.status).toBe(201);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "Password123!",
      });

    expect(loginRes.status).toBe(200);
    const cookie = (loginRes.headers["set-cookie"] as string[])[0].split(";")[0];
    return {
      id: regRes.body.user.id,
      email: regRes.body.user.email,
      cookie,
    };
  }

  beforeAll(async () => {
    // 1. Create users
    organizerEmail = `org_${ts}@example.com`;
    const org = await helperCreateUser("Event Organizer", organizerEmail);
    organizerId = org.id;
    organizerCookie = org.cookie;

    judge1Email = `judge1_${ts}@example.com`;
    const j1 = await helperCreateUser("Judge One", judge1Email);
    judge1Id = j1.id;
    judge1Cookie = j1.cookie;

    judge2Email = `judge2_${ts}@example.com`;
    const j2 = await helperCreateUser("Judge Two", judge2Email);
    judge2Id = j2.id;
    judge2Cookie = j2.cookie;

    participant1Email = `part1_${ts}@example.com`;
    const p1 = await helperCreateUser("Participant One", participant1Email);
    participant1Id = p1.id;
    participant1Cookie = p1.cookie;

    participant2Email = `part2_${ts}@example.com`;
    const p2 = await helperCreateUser("Participant Two", participant2Email);
    participant2Id = p2.id;
    participant2Cookie = p2.cookie;

    // 2. Create Event 1
    const eventRes = await request(app)
      .post("/api/events")
      .set("Cookie", organizerCookie)
      .send({
        name: `Judging Hackathon ${ts}`,
        description: "Event with full judging flow",
        startDate: new Date(Date.now() - 86400000).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        submissionDeadline: new Date(Date.now() + 86400000 * 2).toISOString(),
        judgingDeadline: new Date(Date.now() + 86400000 * 4).toISOString(),
        maxTeamSize: 4,
      });
    expect(eventRes.status).toBe(201);
    event1Id = eventRes.body.event.id;

    // 3. Create Event 2 (for cross-event testing)
    const event2Res = await request(app)
      .post("/api/events")
      .set("Cookie", organizerCookie)
      .send({
        name: `Second Event ${ts}`,
        startDate: new Date(Date.now() - 86400000).toISOString(),
        endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        submissionDeadline: new Date(Date.now() + 86400000 * 2).toISOString(),
        judgingDeadline: new Date(Date.now() + 86400000 * 4).toISOString(),
      });
    expect(event2Res.status).toBe(201);
    event2Id = event2Res.body.event.id;

    // 4. Create Track in Event 1
    const trackRes = await request(app)
      .post(`/api/events/${event1Id}/tracks`)
      .set("Cookie", organizerCookie)
      .send({
        name: "AI & ML",
        description: "Machine learning track",
      });
    expect(trackRes.status).toBe(201);
    track1Id = trackRes.body.track.id;

    // 5. Create Team 1 and Submission 1
    const team1Res = await request(app)
      .post(`/api/events/${event1Id}/teams`)
      .set("Cookie", participant1Cookie)
      .send({
        name: `Team Alpha ${ts}`,
        trackId: track1Id,
      });
    expect(team1Res.status).toBe(201);
    team1Id = team1Res.body.team.id;

    const sub1Res = await request(app)
      .post(`/api/events/${event1Id}/submissions`)
      .set("Cookie", participant1Cookie)
      .send({
        teamId: team1Id,
        trackId: track1Id,
        projectName: "Alpha AI Project",
        description: "Cutting-edge autonomous agent",
        isDraft: false,
      });
    expect(sub1Res.status).toBe(201);
    submission1Id = sub1Res.body.submission.id;

    // 6. Create Team 2 and Submission 2
    const team2Res = await request(app)
      .post(`/api/events/${event1Id}/teams`)
      .set("Cookie", participant2Cookie)
      .send({
        name: `Team Beta ${ts}`,
        trackId: track1Id,
      });
    expect(team2Res.status).toBe(201);
    team2Id = team2Res.body.team.id;

    const sub2Res = await request(app)
      .post(`/api/events/${event1Id}/submissions`)
      .set("Cookie", participant2Cookie)
      .send({
        teamId: team2Id,
        trackId: track1Id,
        projectName: "Beta Neural Project",
        description: "Deep neural reasoning engine",
        isDraft: false,
      });
    expect(sub2Res.status).toBe(201);
    submission2Id = sub2Res.body.submission.id;
  });

  // ==========================================
  // 1. JUDGE INVITATIONS
  // ==========================================
  describe("Judge Invitations", () => {
    let judge1InviteToken: string;
    let judge2InviteToken: string;

    it("non-organizer cannot create judge invitations (rejected with 403)", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judges/invitations`)
        .set("Cookie", participant1Cookie)
        .send({
          email: "stranger@example.com",
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("FORBIDDEN");
    });

    it("organizer can create judge invitations", async () => {
      const res1 = await request(app)
        .post(`/api/events/${event1Id}/judges/invitations`)
        .set("Cookie", organizerCookie)
        .send({
          email: judge1Email,
          expiresInHours: 72,
        });

      expect(res1.status).toBe(201);
      expect(res1.body.invitation.eventId).toBe(event1Id);
      expect(res1.body.invitation.email).toBe(judge1Email);
      expect(res1.body.invitation.invitationToken).toBeDefined();
      judge1InviteToken = res1.body.invitation.invitationToken;

      const res2 = await request(app)
        .post(`/api/events/${event1Id}/judges/invitations`)
        .set("Cookie", organizerCookie)
        .send({
          email: judge2Email,
          expiresInHours: 72,
        });

      expect(res2.status).toBe(201);
      judge2InviteToken = res2.body.invitation.invitationToken;
    });

    it("duplicate pending invitation to same email is rejected with 409", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judges/invitations`)
        .set("Cookie", organizerCookie)
        .send({
          email: judge1Email,
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("INVITATION_ALREADY_PENDING");
    });

    it("invitation cannot be accepted by a user with a different email (rejected with 403)", async () => {
      // participant1 tries to accept judge1's invitation
      const res = await request(app)
        .post(`/api/events/${event1Id}/judges/invitations/${judge1InviteToken}/accept`)
        .set("Cookie", participant1Cookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("EMAIL_MISMATCH");
    });

    it("cross-event invitation acceptance is rejected with 404/400", async () => {
      // Trying to accept event1's invitation in event2
      const res = await request(app)
        .post(`/api/events/${event2Id}/judges/invitations/${judge1InviteToken}/accept`)
        .set("Cookie", judge1Cookie);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("INVITATION_NOT_FOUND");
    });

    it("judge can accept valid invitation and receives EventRole JUDGE", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judges/invitations/${judge1InviteToken}/accept`)
        .set("Cookie", judge1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.invitation.status).toBe("ACCEPTED");

      // Also accept for judge 2
      const res2 = await request(app)
        .post(`/api/events/${event1Id}/judges/invitations/${judge2InviteToken}/accept`)
        .set("Cookie", judge2Cookie);
      expect(res2.status).toBe(200);

      // Verify judge 1 has JUDGE role
      const roleCheck = await prisma.eventRole.findUnique({
        where: {
          eventId_userId_role: {
            eventId: event1Id,
            userId: judge1Id,
            role: EventRoleType.JUDGE,
          },
        },
      });
      expect(roleCheck).not.toBeNull();
    });

    it("already accepted invitation cannot be accepted again (rejected with 400)", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judges/invitations/${judge1InviteToken}/accept`)
        .set("Cookie", judge1Cookie);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INVITATION_ALREADY_ACCEPTED");
    });

    it("organizer can revoke a pending invitation, and revoked invite cannot be accepted", async () => {
      const dummyEmail = `dummy_judge_${ts}@example.com`;
      const invRes = await request(app)
        .post(`/api/events/${event1Id}/judges/invitations`)
        .set("Cookie", organizerCookie)
        .send({ email: dummyEmail });
      expect(invRes.status).toBe(201);
      const dummyId = invRes.body.invitation.id;

      // Revoke
      const revokeRes = await request(app)
        .post(`/api/events/${event1Id}/judges/invitations/${dummyId}/revoke`)
        .set("Cookie", organizerCookie);
      expect(revokeRes.status).toBe(200);
      expect(revokeRes.body.invitation.status).toBe("REVOKED");

      // Dummy user tries to accept
      const dummyUser = await helperCreateUser("Dummy Judge", dummyEmail);
      const acceptRes = await request(app)
        .post(`/api/events/${event1Id}/judges/invitations/${dummyId}/accept`)
        .set("Cookie", dummyUser.cookie);
      expect(acceptRes.status).toBe(400);
      expect(acceptRes.body.error).toBe("INVITATION_REVOKED");
    });
  });

  // ==========================================
  // 2. RUBRIC CONFIGURATION
  // ==========================================
  describe("Rubric Configuration", () => {
    it("organizer can create a rubric for the event", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/rubrics`)
        .set("Cookie", organizerCookie)
        .send({
          name: "Standard Hackathon Evaluation Rubric",
        });

      expect(res.status).toBe(201);
      expect(res.body.rubric.eventId).toBe(event1Id);
      expect(res.body.rubric.name).toBe("Standard Hackathon Evaluation Rubric");
      expect(res.body.rubric.isLocked).toBe(false);

      rubricId = res.body.rubric.id;
    });

    it("duplicate rubric for the same event is rejected with 409", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/rubrics`)
        .set("Cookie", organizerCookie)
        .send({
          name: "Duplicate Rubric",
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("RUBRIC_ALREADY_EXISTS");
    });

    it("organizer can add criteria with weighted basis points", async () => {
      // Criterion 1: Technical Execution (5000 bps = 50%)
      const res1 = await request(app)
        .post(`/api/events/${event1Id}/rubrics/${rubricId}/criteria`)
        .set("Cookie", organizerCookie)
        .send({
          name: "Technical Execution",
          description: "Architecture, code quality, and robustness",
          weightBasisPoints: 5000,
          maxPoints: 10,
          orderIndex: 0,
        });

      expect(res1.status).toBe(201);
      expect(res1.body.criterion.name).toBe("Technical Execution");
      expect(res1.body.criterion.weightBasisPoints).toBe(5000);
      criterion1Id = res1.body.criterion.id;

      // Criterion 2: Innovation & Impact (5000 bps = 50%)
      const res2 = await request(app)
        .post(`/api/events/${event1Id}/rubrics/${rubricId}/criteria`)
        .set("Cookie", organizerCookie)
        .send({
          name: "Innovation & Impact",
          description: "Originality and real-world usefulness",
          weightBasisPoints: 5000,
          maxPoints: 10,
          orderIndex: 1,
        });

      expect(res2.status).toBe(201);
      expect(res2.body.criterion.weightBasisPoints).toBe(5000);
      criterion2Id = res2.body.criterion.id;
    });

    it("adding criteria exceeding 10000 basis points total is rejected with 400", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/rubrics/${rubricId}/criteria`)
        .set("Cookie", organizerCookie)
        .send({
          name: "Excess Criterion",
          weightBasisPoints: 100, // 5000 + 5000 + 100 > 10000
          maxPoints: 5,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INVALID_RUBRIC_WEIGHTS");
    });

    it("locking rubric succeeds when criteria sum exactly to 10000 basis points", async () => {
      const res = await request(app)
        .patch(`/api/events/${event1Id}/rubrics/${rubricId}`)
        .set("Cookie", organizerCookie)
        .send({
          isLocked: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.rubric.isLocked).toBe(true);
    });

    it("modifying criteria on a locked rubric is rejected with 400 RUBRIC_LOCKED", async () => {
      const res = await request(app)
        .patch(`/api/events/${event1Id}/rubrics/${rubricId}/criteria/${criterion1Id}`)
        .set("Cookie", organizerCookie)
        .send({
          weightBasisPoints: 4000,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("RUBRIC_LOCKED");
    });

    it("judge can view the configured rubric", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/rubrics`)
        .set("Cookie", judge1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.rubric.criteria.length).toBe(2);
    });
  });

  // ==========================================
  // 3. JUDGE ASSIGNMENTS
  // ==========================================
  describe("Judge Assignments", () => {
    it("non-organizer cannot create assignments (rejected with 403)", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judges/assignments`)
        .set("Cookie", judge1Cookie)
        .send({
          judgeId: judge1Id,
          submissionId: submission1Id,
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("FORBIDDEN");
    });

    it("assigning a user without JUDGE role is rejected with 400 NOT_EVENT_JUDGE", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judges/assignments`)
        .set("Cookie", organizerCookie)
        .send({
          judgeId: participant1Id,
          submissionId: submission1Id,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("NOT_EVENT_JUDGE");
    });

    it("organizer can assign judges to submissions", async () => {
      // Assign Judge 1 -> Submission 1
      const res1 = await request(app)
        .post(`/api/events/${event1Id}/judges/assignments`)
        .set("Cookie", organizerCookie)
        .send({
          judgeId: judge1Id,
          submissionId: submission1Id,
        });

      expect(res1.status).toBe(201);
      expect(res1.body.assignment.judgeId).toBe(judge1Id);
      expect(res1.body.assignment.submissionId).toBe(submission1Id);
      judge1AssignmentSub1Id = res1.body.assignment.id;

      // Assign Judge 2 -> Submission 1
      const res2 = await request(app)
        .post(`/api/events/${event1Id}/judges/assignments`)
        .set("Cookie", organizerCookie)
        .send({
          judgeId: judge2Id,
          submissionId: submission1Id,
        });

      expect(res2.status).toBe(201);
      judge2AssignmentSub1Id = res2.body.assignment.id;
    });

    it("duplicate assignment for same judge and submission is rejected with 409", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judges/assignments`)
        .set("Cookie", organizerCookie)
        .send({
          judgeId: judge1Id,
          submissionId: submission1Id,
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("DUPLICATE_ASSIGNMENT");
    });

    it("deterministic batch assignment assigns remaining submissions and avoids duplicate active assignments", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judges/assignments/batch`)
        .set("Cookie", organizerCookie)
        .send({
          judgesPerSubmission: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.batchId).toBeDefined();
      expect(res.body.createdCount).toBeGreaterThanOrEqual(1);

      // Verify Judge 1 and Judge 2 now also have assignments for Submission 2
      const listRes = await request(app)
        .get(`/api/events/${event1Id}/judges/assignments`)
        .set("Cookie", organizerCookie);

      expect(listRes.status).toBe(200);
      expect(listRes.body.assignments.length).toBe(4); // 2 judges x 2 submissions

      const j1Sub2 = listRes.body.assignments.find(
        (a: any) => a.judgeId === judge1Id && a.submissionId === submission2Id
      );
      expect(j1Sub2).toBeDefined();
      judge1AssignmentSub2Id = j1Sub2.id;

      const j2Sub2 = listRes.body.assignments.find(
        (a: any) => a.judgeId === judge2Id && a.submissionId === submission2Id
      );
      expect(j2Sub2).toBeDefined();
      judge2AssignmentSub2Id = j2Sub2.id;
    });
  });

  // ==========================================
  // 4. JUDGE ACCESS ISOLATION
  // ==========================================
  describe("Judge Access Isolation", () => {
    it("judge only sees submissions assigned to that judge", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/judging/assignments`)
        .set("Cookie", judge1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.assignments.length).toBe(2);
      expect(res.body.assignments.every((a: any) => a.judgeId === judge1Id)).toBe(true);
    });

    it("judge cannot view assignment details belonging to another judge (rejected with 403)", async () => {
      // Judge 1 tries to access Judge 2's assignment
      const res = await request(app)
        .get(`/api/events/${event1Id}/judging/assignments/${judge2AssignmentSub1Id}`)
        .set("Cookie", judge1Cookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("FORBIDDEN");
    });

    it("judge cannot submit evaluation for another judge's assignment (rejected with 403)", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judging/assignments/${judge2AssignmentSub1Id}/evaluation`)
        .set("Cookie", judge1Cookie)
        .send({
          scores: [
            { criterionId: criterion1Id, score: 9 },
            { criterionId: criterion2Id, score: 8 },
          ],
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("FORBIDDEN");
    });

    it("participant cannot access judge evaluation routes (rejected with 403)", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/judging/assignments`)
        .set("Cookie", participant1Cookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("FORBIDDEN");
    });
  });

  // ==========================================
  // 5. EVALUATION SUBMISSION & SCORE ITEMS
  // ==========================================
  describe("Evaluation Submission", () => {
    it("score exceeding criterion maxPoints is rejected with 400 SCORE_OUT_OF_RANGE", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judging/assignments/${judge1AssignmentSub1Id}/evaluation`)
        .set("Cookie", judge1Cookie)
        .send({
          scores: [
            { criterionId: criterion1Id, score: 15 }, // max is 10
            { criterionId: criterion2Id, score: 8 },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("SCORE_OUT_OF_RANGE");
    });

    it("missing required criterion in rubric is rejected with 400 INCOMPLETE_EVALUATION", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judging/assignments/${judge1AssignmentSub1Id}/evaluation`)
        .set("Cookie", judge1Cookie)
        .send({
          scores: [
            { criterionId: criterion1Id, score: 8 },
            // Missing criterion2
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INCOMPLETE_EVALUATION");
    });

    it("judge can submit valid evaluation with snapshot preservation and computed raw score", async () => {
      // Criterion 1: 9 / 10 (50% weight) -> 45
      // Criterion 2: 8 / 10 (50% weight) -> 40
      // Total Raw Score = 85.0000
      const res = await request(app)
        .post(`/api/events/${event1Id}/judging/assignments/${judge1AssignmentSub1Id}/evaluation`)
        .set("Cookie", judge1Cookie)
        .send({
          scores: [
            { criterionId: criterion1Id, score: 9, comment: "Superb architecture" },
            { criterionId: criterion2Id, score: 8, comment: "High innovation" },
          ],
          feedback: "Great overall project",
        });

      expect(res.status).toBe(201);
      expect(Number(res.body.evaluation.rawTotalScore)).toBe(85);
      expect(res.body.evaluation.scoreItems.length).toBe(2);

      // Verify snapshot fields
      const item1 = res.body.evaluation.scoreItems.find((i: any) => i.criterionId === criterion1Id);
      expect(item1.criterionNameSnapshot).toBe("Technical Execution");
      expect(item1.weightSnapshot).toBe(5000);
      expect(Number(item1.maxPointsSnapshot)).toBe(10);
      expect(Number(item1.score)).toBe(9);

      evaluation1Id = res.body.evaluation.id;
    });

    it("duplicate evaluation on the same assignment is rejected with 409", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judging/assignments/${judge1AssignmentSub1Id}/evaluation`)
        .set("Cookie", judge1Cookie)
        .send({
          scores: [
            { criterionId: criterion1Id, score: 9 },
            { criterionId: criterion2Id, score: 9 },
          ],
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("EVALUATION_ALREADY_EXISTS");
    });

    it("judge can update their own evaluation", async () => {
      // Update scores:
      // Criterion 1: 10 / 10 (50% weight) -> 50
      // Criterion 2: 8 / 10 (50% weight) -> 40
      // Total Raw Score = 90.0000
      const res = await request(app)
        .patch(`/api/events/${event1Id}/judging/evaluations/${evaluation1Id}`)
        .set("Cookie", judge1Cookie)
        .send({
          scores: [
            { criterionId: criterion1Id, score: 10 },
            { criterionId: criterion2Id, score: 8 },
          ],
          feedback: "Updated after careful review",
        });

      expect(res.status).toBe(200);
      expect(Number(res.body.evaluation.rawTotalScore)).toBe(90);
    });

    it("another judge cannot edit this evaluation (rejected with 403)", async () => {
      const res = await request(app)
        .patch(`/api/events/${event1Id}/judging/evaluations/${evaluation1Id}`)
        .set("Cookie", judge2Cookie)
        .send({
          feedback: "Hacked feedback",
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("FORBIDDEN");
    });

    it("submit remaining evaluations across both judges and submissions", async () => {
      // Judge 2 -> Sub 1: C1=7, C2=7 -> Raw Score = 70.0000
      const ev2 = await request(app)
        .post(`/api/events/${event1Id}/judging/assignments/${judge2AssignmentSub1Id}/evaluation`)
        .set("Cookie", judge2Cookie)
        .send({
          scores: [
            { criterionId: criterion1Id, score: 7 },
            { criterionId: criterion2Id, score: 7 },
          ],
        });
      expect(ev2.status).toBe(201);
      expect(Number(ev2.body.evaluation.rawTotalScore)).toBe(70);

      // Judge 1 -> Sub 2: C1=6, C2=6 -> Raw Score = 60.0000
      const ev3 = await request(app)
        .post(`/api/events/${event1Id}/judging/assignments/${judge1AssignmentSub2Id}/evaluation`)
        .set("Cookie", judge1Cookie)
        .send({
          scores: [
            { criterionId: criterion1Id, score: 6 },
            { criterionId: criterion2Id, score: 6 },
          ],
        });
      expect(ev3.status).toBe(201);
      expect(Number(ev3.body.evaluation.rawTotalScore)).toBe(60);

      // Judge 2 -> Sub 2: C1=5, C2=5 -> Raw Score = 50.0000
      const ev4 = await request(app)
        .post(`/api/events/${event1Id}/judging/assignments/${judge2AssignmentSub2Id}/evaluation`)
        .set("Cookie", judge2Cookie)
        .send({
          scores: [
            { criterionId: criterion1Id, score: 5 },
            { criterionId: criterion2Id, score: 5 },
          ],
        });
      expect(ev4.status).toBe(201);
      expect(Number(ev4.body.evaluation.rawTotalScore)).toBe(50);
    });
  });

  // ==========================================
  // 6. CROSS-JUDGE SCORE NORMALIZATION UNIT TESTS
  // ==========================================
  describe("Cross-Judge Normalization Service", () => {
    it("handles identical score distributions preserving relative ranks", () => {
      const evals = [
        { id: "1", judgeId: "j1", submissionId: "s1", rawTotalScore: 80 },
        { id: "2", judgeId: "j1", submissionId: "s2", rawTotalScore: 60 },
        { id: "3", judgeId: "j2", submissionId: "s1", rawTotalScore: 80 },
        { id: "4", judgeId: "j2", submissionId: "s2", rawTotalScore: 60 },
      ];

      const res = normalizationService.normalizeEvaluations(evals);
      const s1Agg = res.submissionAggregates.get("s1")!;
      const s2Agg = res.submissionAggregates.get("s2")!;

      expect(s1Agg.normalizedScore).toBeGreaterThan(s2Agg.normalizedScore);
      expect(s1Agg.rawAverageScore).toBe(80);
      expect(s2Agg.rawAverageScore).toBe(60);
    });

    it("adjusts for different judge grading scales (strict vs lenient judge)", () => {
      // Judge 1 is strict (scores: 60, 40) - Mean: 50, Std: 10
      // Judge 2 is lenient (scores: 90, 70) - Mean: 80, Std: 10
      const evals = [
        { id: "1", judgeId: "jStrict", submissionId: "s1", rawTotalScore: 60 }, // Top for strict
        { id: "2", judgeId: "jStrict", submissionId: "s2", rawTotalScore: 40 }, // Bottom for strict
        { id: "3", judgeId: "jLenient", submissionId: "s1", rawTotalScore: 90 }, // Top for lenient
        { id: "4", judgeId: "jLenient", submissionId: "s2", rawTotalScore: 70 }, // Bottom for lenient
      ];

      const res = normalizationService.normalizeEvaluations(evals);
      const s1Agg = res.submissionAggregates.get("s1")!;
      const s2Agg = res.submissionAggregates.get("s2")!;

      // Both judges ranked s1 top and s2 bottom with equal standard deviations (+1 std)
      // So s1 normalized score should match for both
      expect(s1Agg.normalizedScore).toBeGreaterThan(s2Agg.normalizedScore);
      expect(s1Agg.normalizedScore).toBe(90); // 75 + 15 * 1.0 = 90
      expect(s2Agg.normalizedScore).toBe(60); // 75 + 15 * (-1.0) = 60
    });

    it("handles missing evaluations safely without injecting zero", () => {
      // s1 has 2 evaluations; s2 has only 1 evaluation
      const evals = [
        { id: "1", judgeId: "j1", submissionId: "s1", rawTotalScore: 80 },
        { id: "2", judgeId: "j2", submissionId: "s1", rawTotalScore: 80 },
        { id: "3", judgeId: "j1", submissionId: "s2", rawTotalScore: 60 },
      ];

      const res = normalizationService.normalizeEvaluations(evals);
      const s2Agg = res.submissionAggregates.get("s2")!;

      expect(s2Agg.evaluationsCount).toBe(1);
      expect(s2Agg.rawAverageScore).toBe(60); // Not averaged with 0!
      expect(s2Agg.normalizedScore).toBeGreaterThan(0);
    });

    it("handles single-judge and zero-variance cases safely without divide-by-zero", () => {
      // Judge giving identical score to all submissions (std = 0)
      const evals = [
        { id: "1", judgeId: "jZeroVar", submissionId: "s1", rawTotalScore: 75 },
        { id: "2", judgeId: "jZeroVar", submissionId: "s2", rawTotalScore: 75 },
      ];

      const res = normalizationService.normalizeEvaluations(evals);
      expect(res.normalizedEvaluations.length).toBe(2);
      expect(res.submissionAggregates.get("s1")!.normalizedScore).toBe(75);
      expect(res.submissionAggregates.get("s2")!.normalizedScore).toBe(75);
    });
  });

  // ==========================================
  // 7. FINAL RESULTS GENERATION & PUBLICATION
  // ==========================================
  describe("Final Results & Publication", () => {
    it("non-organizer cannot calculate final results (rejected with 403)", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judging/final-results/calculate`)
        .set("Cookie", judge1Cookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("FORBIDDEN");
    });

    it("organizer can calculate final results with ranking and normalization", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judging/final-results/calculate`)
        .set("Cookie", organizerCookie);

      expect(res.status).toBe(200);
      expect(res.body.results.length).toBe(2);

      // Submission 1 received scores (90 and 70), Sub 2 received (60 and 50)
      // Rank 1 should be Submission 1
      const rank1 = res.body.results.find((r: any) => r.rank === 1);
      expect(rank1.submissionId).toBe(submission1Id);
      expect(Number(rank1.rawAverageScore)).toBe(80); // (90 + 70) / 2 = 80

      const rank2 = res.body.results.find((r: any) => r.rank === 2);
      expect(rank2.submissionId).toBe(submission2Id);
      expect(Number(rank2.rawAverageScore)).toBe(55); // (60 + 50) / 2 = 55
    });

    it("participants cannot view final results before publication (rejected with 403)", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/judging/final-results`)
        .set("Cookie", participant1Cookie);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("RESULTS_NOT_PUBLISHED");
    });

    it("organizer can view final results before publication", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/judging/final-results`)
        .set("Cookie", organizerCookie);

      expect(res.status).toBe(200);
      expect(res.body.results.length).toBe(2);
    });

    it("organizer can publish final results", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/judging/final-results/publish`)
        .set("Cookie", organizerCookie);

      expect(res.status).toBe(200);
      expect(res.body.resultsCount).toBe(2);

      // Verify event is marked resultsPublished
      const event = await prisma.event.findUnique({ where: { id: event1Id } });
      expect(event?.resultsPublished).toBe(true);
    });

    it("after publication, participants can view the final results", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/judging/final-results`)
        .set("Cookie", participant1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.results.length).toBe(2);
      expect(res.body.results[0].submission.projectName).toBe("Alpha AI Project");
    });

    it("raw scores in database are never mutated by normalization or final results calculation", async () => {
      const persistedEval = await prisma.evaluation.findUnique({
        where: { id: evaluation1Id },
      });

      expect(persistedEval).not.toBeNull();
      // Raw score was set to 90 during updateEvaluation and must remain exactly 90
      expect(Number(persistedEval!.rawTotalScore)).toBe(90);
    });

    it("ties do not receive an undocumented winner; tied rank is preserved and recorded in tieBreakerReason", async () => {
      // Set up a tied scenario in Event 2:
      // 1. Create track in Event 2
      const tr2 = await prisma.track.create({
        data: { eventId: event2Id, name: "General Track" },
      });

      // 2. Create Rubric in Event 2
      const r2 = await prisma.rubric.create({
        data: {
          eventId: event2Id,
          name: "Event 2 Rubric",
          isLocked: true,
          criteria: {
            create: [
              {
                name: "Quality",
                weightBasisPoints: 10000,
                maxPoints: 10,
                orderIndex: 0,
              },
            ],
          },
        },
        include: { criteria: true },
      });
      const cQuality = r2.criteria[0];

      // 3. Create 2 teams and 2 submissions
      const tA = await prisma.team.create({
        data: { eventId: event2Id, name: `Tied Team A ${ts}` },
      });
      const subA = await prisma.submission.create({
        data: {
          eventId: event2Id,
          teamId: tA.id,
          trackId: tr2.id,
          projectName: "Tied Project A",
          description: "A",
          status: SubmissionStatus.SUBMITTED,
          isDraft: false,
        },
      });

      const tB = await prisma.team.create({
        data: { eventId: event2Id, name: `Tied Team B ${ts}` },
      });
      const subB = await prisma.submission.create({
        data: {
          eventId: event2Id,
          teamId: tB.id,
          trackId: tr2.id,
          projectName: "Tied Project B",
          description: "B",
          status: SubmissionStatus.SUBMITTED,
          isDraft: false,
        },
      });

      // Assign Judge 1 to both submissions in Event 2
      await prisma.eventRole.create({
        data: { eventId: event2Id, userId: judge1Id, role: EventRoleType.JUDGE },
      });

      const asgnA = await prisma.judgeAssignment.create({
        data: { eventId: event2Id, judgeId: judge1Id, submissionId: subA.id, status: "COMPLETED" },
      });
      const asgnB = await prisma.judgeAssignment.create({
        data: { eventId: event2Id, judgeId: judge1Id, submissionId: subB.id, status: "COMPLETED" },
      });

      // Judge gives IDENTICAL scores (8 / 10 = 80.0000) to both submissions
      await prisma.evaluation.create({
        data: {
          assignmentId: asgnA.id,
          submissionId: subA.id,
          judgeId: judge1Id,
          rawTotalScore: 80,
          isDraft: false,
          scoreItems: {
            create: [
              {
                criterionId: cQuality.id,
                score: 8,
                criterionNameSnapshot: cQuality.name,
                weightSnapshot: cQuality.weightBasisPoints,
                maxPointsSnapshot: 10,
              },
            ],
          },
        },
      });

      await prisma.evaluation.create({
        data: {
          assignmentId: asgnB.id,
          submissionId: subB.id,
          judgeId: judge1Id,
          rawTotalScore: 80,
          isDraft: false,
          scoreItems: {
            create: [
              {
                criterionId: cQuality.id,
                score: 8,
                criterionNameSnapshot: cQuality.name,
                weightSnapshot: cQuality.weightBasisPoints,
                maxPointsSnapshot: 10,
              },
            ],
          },
        },
      });

      // Calculate final results for Event 2
      const calcRes = await request(app)
        .post(`/api/events/${event2Id}/judging/final-results/calculate`)
        .set("Cookie", organizerCookie);

      expect(calcRes.status).toBe(200);
      expect(calcRes.body.results.length).toBe(2);

      // BOTH submissions must have rank 1 (neither is awarded an arbitrary winner position)
      const resA = calcRes.body.results.find((r: any) => r.submissionId === subA.id);
      const resB = calcRes.body.results.find((r: any) => r.submissionId === subB.id);

      expect(resA.rank).toBe(1);
      expect(resB.rank).toBe(1);
      expect(resA.trackRank).toBe(1);
      expect(resB.trackRank).toBe(1);

      // tieBreakerReason must be recorded for both
      expect(resA.tieBreakerReason).toContain("Tied at composite score");
      expect(resB.tieBreakerReason).toContain("Tied at composite score");

      // Verify CSV export also outputs both with Rank 1 without arbitrary distinction
      const csvRes = await request(app)
        .get(`/api/events/${event2Id}/judging/results.csv`)
        .set("Cookie", organizerCookie);

      expect(csvRes.status).toBe(200);
      const csvLines = csvRes.text.trim().split("\r\n");
      // Row 1 (subA or subB) should start with rank 1
      expect(csvLines[1].startsWith("1,1,")).toBe(true);
      // Row 2 should ALSO start with rank 1
      expect(csvLines[2].startsWith("1,1,")).toBe(true);
    });

    it("judge cannot update evaluation after results are published (rejected with 400)", async () => {
      const res = await request(app)
        .patch(`/api/events/${event1Id}/judging/evaluations/${evaluation1Id}`)
        .set("Cookie", judge1Cookie)
        .send({
          scores: [
            { criterionId: criterion1Id, score: 5 },
            { criterionId: criterion2Id, score: 5 },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("RESULTS_ALREADY_PUBLISHED");
    });
  });

  // ==========================================
  // 8. PROGRESS DASHBOARDS
  // ==========================================
  describe("Progress Dashboards", () => {
    it("judge can retrieve personal progress data", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/judging/my-progress`)
        .set("Cookie", judge1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.progress.judgeId).toBe(judge1Id);
      expect(res.body.progress.totalAssigned).toBe(2);
      expect(res.body.progress.completed).toBe(2);
      expect(res.body.progress.remaining).toBe(0);
      expect(res.body.progress.completionPercentage).toBe(100);
    });

    it("organizer can retrieve event-wide judging progress", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/judging/progress`)
        .set("Cookie", organizerCookie);

      expect(res.status).toBe(200);
      expect(res.body.progress.totalAssignments).toBe(4);
      expect(res.body.progress.completedAssignments).toBe(4);
      expect(res.body.progress.overallCompletionPercentage).toBe(100);
      expect(res.body.progress.judges.length).toBe(2);
    });
  });

  // ==========================================
  // 9. CSV EXPORT & AUDIT INTEGRITY
  // ==========================================
  describe("CSV Export and Audit Integrity", () => {
    it("non-organizer cannot export CSV results (rejected with 403)", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/judging/results.csv`)
        .set("Cookie", participant1Cookie);

      expect(res.status).toBe(403);
    });

    it("organizer can export CSV results with proper headers and deterministic rows", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/judging/results.csv`)
        .set("Cookie", organizerCookie);

      expect(res.status).toBe(200);
      expect(res.headers["content-type"]).toContain("text/csv");
      expect(res.headers["content-disposition"]).toContain(".csv");

      const lines = res.text.trim().split("\r\n");
      expect(lines[0]).toBe(
        "Rank,Track Rank,Project Name,Team Name,Track,Raw Average Score,Normalized Score,Final Composite Score,Completed Evaluations Count,Tie Breaker Reason"
      );
      expect(lines.length).toBe(3); // Header + 2 rows
      expect(lines[1]).toContain("Alpha AI Project");
      expect(lines[2]).toContain("Beta Neural Project");
    });

    it("audit trail recorded judging actions in AuditLog table", async () => {
      const logs = await prisma.auditLog.findMany({
        where: {
          action: {
            in: [
              "JUDGE_INVITATION_CREATED",
              "JUDGE_INVITATION_ACCEPTED",
              "RUBRIC_CREATED",
              "JUDGE_ASSIGNMENT_CREATED",
              "EVALUATION_SUBMITTED",
              "FINAL_RESULTS_CALCULATED",
              "FINAL_RESULTS_PUBLISHED",
            ],
          },
        },
      });

      expect(logs.length).toBeGreaterThanOrEqual(7);
      const actions = new Set(logs.map((l) => l.action));
      expect(actions.has("JUDGE_INVITATION_CREATED")).toBe(true);
      expect(actions.has("JUDGE_INVITATION_ACCEPTED")).toBe(true);
      expect(actions.has("RUBRIC_CREATED")).toBe(true);
      expect(actions.has("EVALUATION_SUBMITTED")).toBe(true);
      expect(actions.has("FINAL_RESULTS_CALCULATED")).toBe(true);
      expect(actions.has("FINAL_RESULTS_PUBLISHED")).toBe(true);
    });
  });
});
