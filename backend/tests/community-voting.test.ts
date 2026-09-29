import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { communityService } from "../src/modules/community/community.service";

describe("T1 Extensions, T3 Community Voting, Comments, Audit & Visibility Gating", () => {
  const ts = Date.now();

  let adminCookie: string;
  let adminId: string;

  let organizerCookie: string;
  let organizerId: string;

  let participantCookie: string;
  let participantId: string;

  let otherParticipantCookie: string;
  let otherParticipantId: string;

  let eventId: string;
  let trackId: string;
  let teamId: string;
  let submissionId: string;

  const helperRegisterLogin = async (name: string, email: string, globalRole: "SUPER_ADMIN" | "USER" = "USER") => {
    const password = "Password123!Secure";
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({ name, email, password });
    expect(regRes.status).toBe(201);

    if (globalRole === "SUPER_ADMIN") {
      await prisma.user.update({
        where: { id: regRes.body.user.id },
        data: { globalRole: "SUPER_ADMIN" },
      });
    }

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(loginRes.status).toBe(200);

    const cookie = (loginRes.headers["set-cookie"] as string[])[0].split(";")[0];
    return { user: regRes.body.user, cookie };
  };

  beforeAll(async () => {
    // 1. Create admin, organizer, participants
    const admin = await helperRegisterLogin("Platform Admin", `admin_${ts}@example.com`, "SUPER_ADMIN");
    adminCookie = admin.cookie;
    adminId = admin.user.id;

    const org = await helperRegisterLogin("Event Organizer", `org_comm_${ts}@example.com`);
    organizerCookie = org.cookie;
    organizerId = org.user.id;

    const p1 = await helperRegisterLogin("Voter One", `voter1_${ts}@example.com`);
    participantCookie = p1.cookie;
    participantId = p1.user.id;

    const p2 = await helperRegisterLogin("Voter Two", `voter2_${ts}@example.com`);
    otherParticipantCookie = p2.cookie;
    otherParticipantId = p2.user.id;

    // 2. Create active event
    const now = new Date();
    const eventRes = await request(app)
      .post("/api/events")
      .set("Cookie", organizerCookie)
      .send({
        name: `Community Voting Hackathon ${ts}`,
        description: "Event for testing voting, comments, and visibility",
        status: "ACTIVE",
        startDate: new Date(now.getTime() - 3600000).toISOString(),
        endDate: new Date(now.getTime() + 86400000 * 5).toISOString(),
        submissionDeadline: new Date(now.getTime() + 86400000 * 2).toISOString(),
        judgingDeadline: new Date(now.getTime() + 86400000 * 4).toISOString(),
        maxTeamSize: 4,
      });
    expect(eventRes.status).toBe(201);
    eventId = eventRes.body.event.id;

    // 3. Create track
    const trackRes = await request(app)
      .post(`/api/events/${eventId}/tracks`)
      .set("Cookie", organizerCookie)
      .send({
        name: "General AI Track",
        description: "Open AI and autonomous agents",
      });
    expect(trackRes.status).toBe(201);
    trackId = trackRes.body.track.id;

    // 4. Create team with participant
    const teamRes = await request(app)
      .post(`/api/events/${eventId}/teams`)
      .set("Cookie", participantCookie)
      .send({
        name: `Innovators ${ts}`,
        trackId,
      });
    expect(teamRes.status).toBe(201);
    teamId = teamRes.body.team.id;

    // 5. Create and finalize submission
    const subRes = await request(app)
      .post(`/api/events/${eventId}/submissions`)
      .set("Cookie", participantCookie)
      .send({
        teamId,
        trackId,
        projectName: "AI Health Monitor",
        tagline: "Automated telemetry diagnostics",
        description: "Full end-to-end edge AI monitoring platform.",
        isDraft: false,
      });
    expect(subRes.status).toBe(201);
    submissionId = subRes.body.submission.id;
  });

  afterAll(async () => {
    // Cleanup created test records
    await prisma.communityComment.deleteMany({ where: { eventId } });
    await prisma.communityVote.deleteMany({ where: { eventId } });
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { userId: { in: [adminId, organizerId, participantId, otherParticipantId] } },
          { entityId: eventId },
          { entityId: submissionId },
        ],
      },
    });
    await prisma.submission.deleteMany({ where: { eventId } });
    await prisma.teamMember.deleteMany({ where: { eventId } });
    await prisma.team.deleteMany({ where: { eventId } });
    await prisma.track.deleteMany({ where: { eventId } });
    await prisma.eventRole.deleteMany({ where: { eventId } });
    await prisma.event.delete({ where: { id: eventId } });
    await prisma.session.deleteMany({
      where: { userId: { in: [adminId, organizerId, participantId, otherParticipantId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [adminId, organizerId, participantId, otherParticipantId] } },
    });
  });

  // -------------------------------------------------------------
  // 1. T1 Events & Gallery Listing
  // -------------------------------------------------------------
  describe("Event & Gallery Listing APIs", () => {
    it("lists events with pagination and status filter", async () => {
      const res = await request(app)
        .get("/api/events?status=ACTIVE")
        .expect(200);

      expect(res.body).toHaveProperty("events");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.events)).toBe(true);
      const found = res.body.events.some((e: any) => e.id === eventId);
      expect(found).toBe(true);
    });

    it("lists submissions in event gallery with track filter", async () => {
      const res = await request(app)
        .get(`/api/events/${eventId}/submissions?trackId=${trackId}`)
        .expect(200);

      expect(res.body).toHaveProperty("submissions");
      expect(res.body.submissions.length).toBeGreaterThanOrEqual(1);
      expect(res.body.submissions[0].id).toBe(submissionId);
    });

    it("accesses project via top-level /api/projects/:id alias", async () => {
      const res = await request(app)
        .get(`/api/projects/${submissionId}`)
        .expect(200);

      expect(res.body.submission).toBeDefined();
      expect(res.body.submission.projectName).toBe("AI Health Monitor");
    });
  });

  // -------------------------------------------------------------
  // 2. T1 Team Listing & Leaving
  // -------------------------------------------------------------
  describe("Team Listing and Membership", () => {
    it("lists teams within an event", async () => {
      const res = await request(app)
        .get(`/api/events/${eventId}/teams`)
        .expect(200);

      expect(res.body.teams).toBeDefined();
      expect(res.body.teams.some((t: any) => t.id === teamId)).toBe(true);
    });

    it("accesses team via top-level /api/teams/:id alias", async () => {
      const res = await request(app)
        .get(`/api/teams/${teamId}`)
        .expect(200);

      expect(res.body.team).toBeDefined();
      expect(res.body.team.id).toBe(teamId);
    });
  });

  // -------------------------------------------------------------
  // 3. User Management & Admin RBAC
  // -------------------------------------------------------------
  describe("User Management (/api/users)", () => {
    it("rejects unauthenticated user listing", async () => {
      await request(app).get("/api/users").expect(401);
    });

    it("rejects regular participant from listing all users", async () => {
      await request(app)
        .get("/api/users")
        .set("Cookie", participantCookie)
        .expect(403);
    });

    it("allows platform admin to list users", async () => {
      const res = await request(app)
        .get("/api/users?search=Voter")
        .set("Cookie", adminCookie)
        .expect(200);

      expect(res.body.users).toBeDefined();
      expect(res.body.users.length).toBeGreaterThanOrEqual(1);
    });

    it("allows admin to view user profile", async () => {
      const res = await request(app)
        .get(`/api/users/${participantId}`)
        .set("Cookie", adminCookie)
        .expect(200);

      expect(res.body.user.id).toBe(participantId);
    });

    it("allows user to view their own profile", async () => {
      const res = await request(app)
        .get(`/api/users/${participantId}`)
        .set("Cookie", participantCookie)
        .expect(200);

      expect(res.body.user.id).toBe(participantId);
    });

    it("allows admin to update user status", async () => {
      const res = await request(app)
        .patch(`/api/users/${otherParticipantId}`)
        .set("Cookie", adminCookie)
        .send({ name: "Updated Voter Two" })
        .expect(200);

      expect(res.body.user.name).toBe("Updated Voter Two");
    });
  });

  // -------------------------------------------------------------
  // 4. T3 Community Voting & Duplicate Prevention
  // -------------------------------------------------------------
  describe("Community Voting Engine", () => {
    beforeAll(() => {
      communityService.resetRateLimits();
    });

    it("allows authenticated participant to cast a vote", async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/community/submissions/${submissionId}/vote`)
        .set("Cookie", participantCookie)
        .send({ voterFingerprint: "fingerprint_voter_alpha_1234" })
        .expect(201);

      expect(res.body.message).toBe("Vote recorded successfully.");
      expect(res.body.voteCount).toBe(1);
    });

    it("prevents duplicate vote by the same authenticated user (409 DUPLICATE_VOTE)", async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/community/submissions/${submissionId}/vote`)
        .set("Cookie", participantCookie)
        .send({ voterFingerprint: "different_fingerprint_same_user_1234" })
        .expect(409);

      expect(res.body.error).toBe("DUPLICATE_VOTE");
    });

    it("prevents duplicate vote from the same fingerprint (409 DUPLICATE_VOTE)", async () => {
      // Different user account but identical fingerprint
      const res = await request(app)
        .post(`/api/events/${eventId}/community/submissions/${submissionId}/vote`)
        .set("Cookie", otherParticipantCookie)
        .send({ voterFingerprint: "fingerprint_voter_alpha_1234" })
        .expect(409);

      expect(res.body.error).toBe("DUPLICATE_VOTE");
    });

    it("allows second distinct user with distinct fingerprint to vote", async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/community/submissions/${submissionId}/vote`)
        .set("Cookie", otherParticipantCookie)
        .send({ voterFingerprint: "fingerprint_voter_beta_5678" })
        .expect(201);

      expect(res.body.voteCount).toBe(2);
    });

    it("retrieves vote statistics for the submission", async () => {
      const res = await request(app)
        .get(`/api/events/${eventId}/community/submissions/${submissionId}/votes?fingerprint=fingerprint_voter_alpha_1234`)
        .set("Cookie", participantCookie)
        .expect(200);

      expect(res.body.totalVotes).toBe(2);
      expect(res.body.hasVoted).toBe(true);
    });

    it("casts vote via top-level /api/votes router", async () => {
      const res = await request(app)
        .post("/api/votes")
        .send({
          eventId,
          submissionId,
          voterFingerprint: "unique_fp_top_level_9999",
        })
        .expect(201);

      expect(res.body.voteCount).toBe(3);
    });

    it("enforces server-side rate limiting when voting threshold is exceeded (429)", async () => {
      communityService.resetRateLimits();

      // Send 10 rapid vote attempts
      for (let i = 0; i < 10; i++) {
        try {
          await communityService.castVote(
            eventId,
            submissionId,
            { voterFingerprint: `rate_limit_fp_${i}_12345` },
            null,
            "10.0.0.1"
          );
        } catch (e: any) {
          // ignore duplicate or success
        }
      }

      // 11th request with same IP should be blocked by rate limiter
      await expect(
        communityService.castVote(
          eventId,
          submissionId,
          { voterFingerprint: "rate_limit_fp_overflow" },
          null,
          "10.0.0.1"
        )
      ).rejects.toMatchObject({
        statusCode: 429,
        code: "RATE_LIMIT_EXCEEDED",
      });
    });
  });

  // -------------------------------------------------------------
  // 5. T3 Community Comments & Moderation
  // -------------------------------------------------------------
  describe("Community Comments & Moderation", () => {
    let commentId: string;

    it("allows authenticated user to comment on project", async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/community/submissions/${submissionId}/comments`)
        .set("Cookie", participantCookie)
        .send({ content: "Outstanding project architecture! Really well designed." })
        .expect(201);

      expect(res.body.comment).toBeDefined();
      expect(res.body.comment.content).toBe("Outstanding project architecture! Really well designed.");
      expect(res.body.comment.moderationStatus).toBe("APPROVED");
      commentId = res.body.comment.id;
    });

    it("lists approved comments for project", async () => {
      const res = await request(app)
        .get(`/api/events/${eventId}/community/submissions/${submissionId}/comments`)
        .expect(200);

      expect(res.body.comments).toBeDefined();
      expect(res.body.comments.some((c: any) => c.id === commentId)).toBe(true);
    });

    it("allows organizer to moderate comment (FLAGGED)", async () => {
      const res = await request(app)
        .patch(`/api/events/${eventId}/community/comments/${commentId}/moderate`)
        .set("Cookie", organizerCookie)
        .send({ moderationStatus: "FLAGGED" })
        .expect(200);

      expect(res.body.comment.moderationStatus).toBe("FLAGGED");
    });

    it("hides non-approved comments from public listing", async () => {
      const res = await request(app)
        .get(`/api/events/${eventId}/community/submissions/${submissionId}/comments`)
        .expect(200);

      // FLAGGED comment should not be visible to unauthenticated or regular users
      expect(res.body.comments.some((c: any) => c.id === commentId)).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 6. T3 Result Visibility Gating
  // -------------------------------------------------------------
  describe("Result Visibility Gating", () => {
    it("denies regular participant from viewing results when resultsPublished is false (403)", async () => {
      const res = await request(app)
        .get(`/api/events/${eventId}/judging/final-results`)
        .set("Cookie", participantCookie)
        .expect(403);

      expect(res.body.error).toBe("RESULTS_NOT_PUBLISHED");
    });

    it("allows organizer to view results even before publication", async () => {
      // Calculate results first if rubric exists, or verify organizer access check
      const res = await request(app)
        .get(`/api/events/${eventId}/judging/final-results`)
        .set("Cookie", organizerCookie)
        .expect(200);

      expect(res.body.results).toBeDefined();
    });

    it("allows public/participant to view results after publication", async () => {
      // Publish results
      await prisma.event.update({
        where: { id: eventId },
        data: { resultsPublished: true },
      });

      const res = await request(app)
        .get(`/api/events/${eventId}/judging/final-results`)
        .set("Cookie", participantCookie)
        .expect(200);

      expect(res.body.results).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 7. Audit Logging System
  // -------------------------------------------------------------
  describe("Audit Trail System", () => {
    it("rejects unauthorized access to /api/audit", async () => {
      await request(app)
        .get("/api/audit")
        .set("Cookie", participantCookie)
        .expect(403);
    });

    it("allows admin to query audit records", async () => {
      const res = await request(app)
        .get("/api/audit")
        .set("Cookie", adminCookie)
        .expect(200);

      expect(res.body).toHaveProperty("logs");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.logs)).toBe(true);
    });

    it("verifies that duplicate vote attempts generated audit logs", async () => {
      const res = await request(app)
        .get("/api/audit?action=COMMUNITY_VOTE_DUPLICATE_REJECTED")
        .set("Cookie", adminCookie)
        .expect(200);

      expect(res.body.logs.length).toBeGreaterThanOrEqual(1);
      const duplicateLog = res.body.logs.find(
        (l: any) => l.action === "COMMUNITY_VOTE_DUPLICATE_REJECTED"
      );
      expect(duplicateLog).toBeDefined();
      expect(duplicateLog.entityType).toBe("COMMUNITY_VOTE");
    });
  });
});
