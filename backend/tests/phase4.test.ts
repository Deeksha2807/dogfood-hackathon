import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";

describe("Phase 4 Event, Track, Prize, Team, Invite & Submission", () => {
  const ts = Date.now();

  let organizerCookie: string;
  let organizerId: string;

  let participant1Cookie: string;
  let participant1Id: string;

  let participant2Cookie: string;
  let participant2Id: string;

  let outsiderCookie: string;

  let event1Id: string;
  let event2Id: string;
  let expiredDeadlineEventId: string;

  let track1Id: string;
  let track2Id: string; // from event 2

  let prize1Id: string;

  let team1Id: string;
  let team2Id: string;

  let submission1Id: string;

  const helperCreateUser = async (name: string, email: string) => {
    const password = "Password123!Secure";
    const regRes = await request(app)
      .post("/api/auth/register")
      .send({ name, email, password });
    expect(regRes.status).toBe(201);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(loginRes.status).toBe(200);

    const cookie = (loginRes.headers["set-cookie"] as string[])[0].split(";")[0];
    return { user: regRes.body.user, cookie };
  };

  beforeAll(async () => {
    // 1. Create users
    const org = await helperCreateUser("Organizer One", `org_${ts}@example.com`);
    organizerCookie = org.cookie;
    organizerId = org.user.id;

    const p1 = await helperCreateUser("Participant One", `p1_${ts}@example.com`);
    participant1Cookie = p1.cookie;
    participant1Id = p1.user.id;

    const p2 = await helperCreateUser("Participant Two", `p2_${ts}@example.com`);
    participant2Cookie = p2.cookie;
    participant2Id = p2.user.id;

    const out = await helperCreateUser("Outsider User", `out_${ts}@example.com`);
    outsiderCookie = out.cookie;
  });

  afterAll(async () => {
    try {
      // Clean up in reverse dependency order
      const eventIds = [event1Id, event2Id, expiredDeadlineEventId].filter(Boolean);

      if (eventIds.length > 0) {
        await prisma.submission.deleteMany({ where: { eventId: { in: eventIds } } });
        await prisma.teamInvite.deleteMany({
          where: { team: { eventId: { in: eventIds } } },
        });
        await prisma.teamMember.deleteMany({ where: { eventId: { in: eventIds } } });
        await prisma.team.deleteMany({ where: { eventId: { in: eventIds } } });
        await prisma.prize.deleteMany({ where: { eventId: { in: eventIds } } });
        await prisma.track.deleteMany({ where: { eventId: { in: eventIds } } });
        await prisma.eventRole.deleteMany({ where: { eventId: { in: eventIds } } });
        await prisma.event.deleteMany({ where: { id: { in: eventIds } } });
      }

      await prisma.session.deleteMany({
        where: {
          user: {
            email: {
              contains: `_${ts}@example.com`,
            },
          },
        },
      });

      await prisma.user.deleteMany({
        where: {
          email: {
            contains: `_${ts}@example.com`,
          },
        },
      });
    } catch {
      // Ignore cleanup error
    }
  });

  // ==========================================
  // 1. EVENT MANAGEMENT
  // ==========================================
  describe("Event Management", () => {
    it("organizer can create an event and is assigned ORGANIZER role", async () => {
      const now = Date.now();
      const res = await request(app)
        .post("/api/events")
        .set("Cookie", organizerCookie)
        .send({
          name: `Hackathon Alpha ${ts}`,
          description: "A premier AI and Systems Hackathon",
          startDate: new Date(now + 86400000).toISOString(),
          endDate: new Date(now + 86400000 * 4).toISOString(),
          submissionDeadline: new Date(now + 86400000 * 2).toISOString(),
          judgingDeadline: new Date(now + 86400000 * 3).toISOString(),
          maxTeamSize: 3,
        });

      expect(res.status).toBe(201);
      expect(res.body.event).toBeDefined();
      expect(res.body.event.name).toBe(`Hackathon Alpha ${ts}`);
      expect(res.body.event.maxTeamSize).toBe(3);

      event1Id = res.body.event.id;

      // Verify creator holds event-scoped ORGANIZER role
      const accessRes = await request(app)
        .get(`/api/events/${event1Id}/access`)
        .set("Cookie", organizerCookie);
      expect(accessRes.status).toBe(200);
      expect(accessRes.body.role).toBe("ORGANIZER");
    });

    it("event dates are strictly validated (endDate must be after startDate)", async () => {
      const now = Date.now();
      const res = await request(app)
        .post("/api/events")
        .set("Cookie", organizerCookie)
        .send({
          name: "Invalid Date Hackathon",
          startDate: new Date(now + 86400000 * 4).toISOString(),
          endDate: new Date(now + 86400000).toISOString(), // End before start
          submissionDeadline: new Date(now + 86400000 * 2).toISOString(),
          judgingDeadline: new Date(now + 86400000 * 3).toISOString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("VALIDATION_ERROR");
    });

    it("non-organizer cannot modify event", async () => {
      const res = await request(app)
        .patch(`/api/events/${event1Id}`)
        .set("Cookie", outsiderCookie)
        .send({ name: "Malicious Rename" });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("FORBIDDEN");
    });

    it("organizer can update event configuration", async () => {
      const res = await request(app)
        .patch(`/api/events/${event1Id}`)
        .set("Cookie", organizerCookie)
        .send({ description: "Updated event description." });

      expect(res.status).toBe(200);
      expect(res.body.event.description).toBe("Updated event description.");
    });

    it("creates a second event for cross-event boundary testing", async () => {
      const now = Date.now();
      const res = await request(app)
        .post("/api/events")
        .set("Cookie", organizerCookie)
        .send({
          name: `Hackathon Beta ${ts}`,
          startDate: new Date(now + 86400000).toISOString(),
          endDate: new Date(now + 86400000 * 4).toISOString(),
          submissionDeadline: new Date(now + 86400000 * 2).toISOString(),
          judgingDeadline: new Date(now + 86400000 * 3).toISOString(),
        });

      expect(res.status).toBe(201);
      event2Id = res.body.event.id;
    });

    it("creates an event with expired submission deadline to test deadline enforcement", async () => {
      const now = Date.now();
      // Bypass createEvent Zod refine by inserting directly to DB to test deadline service logic
      const expiredEvent = await prisma.event.create({
        data: {
          name: `Expired Deadline Event ${ts}`,
          startDate: new Date(now - 86400000 * 5),
          endDate: new Date(now + 86400000 * 2),
          submissionDeadline: new Date(now - 86400000), // 1 day ago
          judgingDeadline: new Date(now + 86400000),
          maxTeamSize: 4,
        },
      });
      expiredDeadlineEventId = expiredEvent.id;

      await prisma.eventRole.create({
        data: {
          eventId: expiredDeadlineEventId,
          userId: organizerId,
          role: "ORGANIZER",
        },
      });
    });
  });

  // ==========================================
  // 2. TRACKS
  // ==========================================
  describe("Tracks", () => {
    it("organizer can create a track", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/tracks`)
        .set("Cookie", organizerCookie)
        .send({
          name: "Artificial Intelligence",
          description: "Generative AI, machine learning, and neural models",
        });

      expect(res.status).toBe(201);
      expect(res.body.track.name).toBe("Artificial Intelligence");
      expect(res.body.track.eventId).toBe(event1Id);
      track1Id = res.body.track.id;
    });

    it("creates track in event 2 for cross-event tests", async () => {
      const res = await request(app)
        .post(`/api/events/${event2Id}/tracks`)
        .set("Cookie", organizerCookie)
        .send({
          name: "Web3 & Decentralization",
          description: "Smart contracts and dApps",
        });

      expect(res.status).toBe(201);
      track2Id = res.body.track.id;
    });

    it("lists tracks for an event", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/tracks`)
        .set("Cookie", organizerCookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tracks)).toBe(true);
      expect(res.body.tracks.length).toBeGreaterThanOrEqual(1);
    });

    it("organizer can update track", async () => {
      const res = await request(app)
        .patch(`/api/events/${event1Id}/tracks/${track1Id}`)
        .set("Cookie", organizerCookie)
        .send({ name: "AI & Intelligent Systems" });

      expect(res.status).toBe(200);
      expect(res.body.track.name).toBe("AI & Intelligent Systems");
    });

    it("cross-event track access is rejected (track from event 2 modified via event 1 URL)", async () => {
      const res = await request(app)
        .patch(`/api/events/${event1Id}/tracks/${track2Id}`)
        .set("Cookie", organizerCookie)
        .send({ name: "Cross Event Name" });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("TRACK_NOT_FOUND");
    });
  });

  // ==========================================
  // 3. PRIZES
  // ==========================================
  describe("Prizes", () => {
    it("organizer can create a prize with a valid track from the same event", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/prizes`)
        .set("Cookie", organizerCookie)
        .send({
          name: "Grand Champion",
          description: "Top overall technical project",
          cashValue: 5000,
          trackId: track1Id,
        });

      expect(res.status).toBe(201);
      expect(res.body.prize.name).toBe("Grand Champion");
      expect(res.body.prize.eventId).toBe(event1Id);
      prize1Id = res.body.prize.id;
    });

    it("cross-event track reference in prize creation is rejected", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/prizes`)
        .set("Cookie", organizerCookie)
        .send({
          name: "Invalid Track Prize",
          cashValue: 1000,
          trackId: track2Id, // from event 2!
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("CROSS_EVENT_TRACK_MISMATCH");
    });

    it("organizer can list prizes for an event", async () => {
      const res = await request(app)
        .get(`/api/events/${event1Id}/prizes`)
        .set("Cookie", organizerCookie);

      expect(res.status).toBe(200);
      expect(res.body.prizes.length).toBeGreaterThanOrEqual(1);
    });

    it("organizer can update prize", async () => {
      const res = await request(app)
        .patch(`/api/events/${event1Id}/prizes/${prize1Id}`)
        .set("Cookie", organizerCookie)
        .send({ cashValue: 6000 });

      expect(res.status).toBe(200);
      expect(Number(res.body.prize.cashValue)).toBe(6000);
    });
  });

  // ==========================================
  // 4. TEAM CREATION & MEMBERSHIP
  // ==========================================
  describe("Team Creation and Membership", () => {
    it("participant can create a team and creator becomes LEADER member", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/teams`)
        .set("Cookie", participant1Cookie)
        .send({
          name: `NeuralPulse Team ${ts}`,
          trackId: track1Id,
        });

      expect(res.status).toBe(201);
      expect(res.body.team.name).toBe(`NeuralPulse Team ${ts}`);
      expect(res.body.team.eventId).toBe(event1Id);
      expect(res.body.team.members.length).toBe(1);
      expect(res.body.team.members[0].userId).toBe(participant1Id);
      expect(res.body.team.members[0].role).toBe("LEADER");

      team1Id = res.body.team.id;
    });

    it("duplicate team membership in the same event is rejected with 409", async () => {
      // participant 1 tries to create another team in event 1
      const res = await request(app)
        .post(`/api/events/${event1Id}/teams`)
        .set("Cookie", participant1Cookie)
        .send({
          name: `Second Team Attempt ${ts}`,
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe("ALREADY_IN_TEAM");
    });

    it("cross-event track reference during team creation is rejected", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/teams`)
        .set("Cookie", participant2Cookie)
        .send({
          name: `Cross Track Team ${ts}`,
          trackId: track2Id, // from event 2!
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("CROSS_EVENT_TRACK_MISMATCH");
    });
  });

  // ==========================================
  // 5. TEAM INVITES
  // ==========================================
  describe("Team Invites", () => {
    let inviteCode: string;

    it("team leader can create an invite", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/teams/${team1Id}/invites`)
        .set("Cookie", participant1Cookie)
        .send({
          maxUses: 5,
          expiresInHours: 48,
        });

      expect(res.status).toBe(201);
      expect(res.body.invite.inviteCode).toBeDefined();
      expect(res.body.invite.teamId).toBe(team1Id);

      inviteCode = res.body.invite.inviteCode;
    });

    it("valid invite can be accepted by another participant", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/team-invites/${inviteCode}/accept`)
        .set("Cookie", participant2Cookie);

      expect(res.status).toBe(200);
      expect(res.body.teamId).toBe(team1Id);

      // Verify participant 2 is now on team 1
      const teamRes = await request(app)
        .get(`/api/events/${event1Id}/teams/${team1Id}`)
        .set("Cookie", participant1Cookie);

      expect(teamRes.status).toBe(200);
      expect(teamRes.body.team.members.length).toBe(2);
      expect(teamRes.body.team.members.some((m: any) => m.userId === participant2Id)).toBe(true);
    });

    it("already-joined participant cannot accept invite again (rejected with 400)", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/team-invites/${inviteCode}/accept`)
        .set("Cookie", participant2Cookie);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("ALREADY_TEAM_MEMBER");
    });

    it("invite cannot exceed team capacity", async () => {
      // event1 has maxTeamSize = 3. Current team size = 2.
      // Add a third member (outsider)
      const acceptRes = await request(app)
        .post(`/api/events/${event1Id}/team-invites/${inviteCode}/accept`)
        .set("Cookie", outsiderCookie);
      expect(acceptRes.status).toBe(200);

      // Now team has 3 members (full). Create a 4th user to test capacity rejection
      const p4 = await helperCreateUser("Participant Four", `p4_${ts}@example.com`);

      const overCapRes = await request(app)
        .post(`/api/events/${event1Id}/team-invites/${inviteCode}/accept`)
        .set("Cookie", p4.cookie);

      expect(overCapRes.status).toBe(400);
      expect(overCapRes.body.error).toBe("TEAM_FULL");
    });

    it("expired invite is rejected", async () => {
      // Create an already-expired invite directly in DB
      const expiredInvite = await prisma.teamInvite.create({
        data: {
          teamId: team1Id,
          inviteCode: `EXP${ts.toString().slice(-5)}`,
          inviteToken: `token_exp_${ts}`,
          expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
          status: "ACTIVE",
          maxUses: 5,
        },
      });

      const p5 = await helperCreateUser("Participant Five", `p5_${ts}@example.com`);
      const res = await request(app)
        .post(`/api/events/${event1Id}/team-invites/${expiredInvite.inviteCode}/accept`)
        .set("Cookie", p5.cookie);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INVITE_EXPIRED");
    });

    it("invite with exhausted uses is rejected", async () => {
      const exhaustedInvite = await prisma.teamInvite.create({
        data: {
          teamId: team1Id,
          inviteCode: `MAX${ts.toString().slice(-5)}`,
          inviteToken: `token_max_${ts}`,
          expiresAt: new Date(Date.now() + 86400000),
          status: "ACTIVE",
          maxUses: 1,
          usedCount: 1, // Already used once
        },
      });

      const p6 = await helperCreateUser("Participant Six", `p6_${ts}@example.com`);
      const res = await request(app)
        .post(`/api/events/${event1Id}/team-invites/${exhaustedInvite.inviteCode}/accept`)
        .set("Cookie", p6.cookie);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("INVITE_MAX_USES_REACHED");
    });
  });

  // ==========================================
  // 6. SUBMISSIONS
  // ==========================================
  describe("Submissions", () => {
    it("team can create a draft submission with a track from the same event", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/submissions`)
        .set("Cookie", participant1Cookie)
        .send({
          teamId: team1Id,
          trackId: track1Id,
          projectName: "NeuralCore Engine",
          tagline: "Scalable neural inference on edge devices",
          description: "High-performance lightweight framework for transformer acceleration.",
          repoUrl: "https://github.com/example/neuralcore",
          demoUrl: "https://demo.neuralcore.io",
          isDraft: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.submission.projectName).toBe("NeuralCore Engine");
      expect(res.body.submission.isDraft).toBe(true);
      expect(res.body.submission.status).toBe("DRAFT");
      expect(res.body.submission.eventId).toBe(event1Id);

      submission1Id = res.body.submission.id;
    });

    it("submission using track from a different event is rejected", async () => {
      // Create another team in event 2 with a fresh user
      const freshUser = await helperCreateUser("Fresh User", `fresh_${ts}@example.com`);
      const teamInEvent2 = await request(app)
        .post(`/api/events/${event2Id}/teams`)
        .set("Cookie", freshUser.cookie)
        .send({ name: `Event 2 Team ${ts}` });
      expect(teamInEvent2.status).toBe(201);

      // Try to submit in event 2 referencing track1Id (from event 1)
      const res = await request(app)
        .post(`/api/events/${event2Id}/submissions`)
        .set("Cookie", freshUser.cookie)
        .send({
          teamId: teamInEvent2.body.team.id,
          trackId: track1Id, // from event 1!
          projectName: "Cross Event Submission",
          description: "Should fail due to cross event track mismatch.",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("CROSS_EVENT_TRACK_MISMATCH");
    });

    it("team member can edit their own draft submission", async () => {
      const res = await request(app)
        .patch(`/api/events/${event1Id}/submissions/${submission1Id}`)
        .set("Cookie", participant2Cookie) // participant 2 is on team 1!
        .send({
          tagline: "Updated edge intelligence tagline.",
        });

      expect(res.status).toBe(200);
      expect(res.body.submission.tagline).toBe("Updated edge intelligence tagline.");
    });

    it("another team's user cannot edit the submission (rejected with 403)", async () => {
      const unauth = await helperCreateUser("Unrelated User", `unrelated_${ts}@example.com`);

      const res = await request(app)
        .patch(`/api/events/${event1Id}/submissions/${submission1Id}`)
        .set("Cookie", unauth.cookie)
        .send({
          projectName: "Hacked Project Name",
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("FORBIDDEN");
    });

    it("finalization works before the deadline", async () => {
      const res = await request(app)
        .post(`/api/events/${event1Id}/submissions/${submission1Id}/finalize`)
        .set("Cookie", participant1Cookie);

      expect(res.status).toBe(200);
      expect(res.body.submission.isDraft).toBe(false);
      expect(res.body.submission.status).toBe("SUBMITTED");
      expect(res.body.submission.submittedAt).toBeDefined();
    });

    it("submission creation is rejected when the event deadline has passed", async () => {
      // In expiredDeadlineEventId, create a team directly
      const lateUser = await helperCreateUser("Late User", `late_${ts}@example.com`);
      const lateTeam = await prisma.team.create({
        data: {
          eventId: expiredDeadlineEventId,
          name: `Late Team ${ts}`,
        },
      });

      await prisma.teamMember.create({
        data: {
          teamId: lateTeam.id,
          userId: lateUser.user.id,
          eventId: expiredDeadlineEventId,
          role: "LEADER",
        },
      });

      const lateTrack = await prisma.track.create({
        data: {
          eventId: expiredDeadlineEventId,
          name: `Late Track ${ts}`,
        },
      });

      const res = await request(app)
        .post(`/api/events/${expiredDeadlineEventId}/submissions`)
        .set("Cookie", lateUser.cookie)
        .send({
          teamId: lateTeam.id,
          trackId: lateTrack.id,
          projectName: "Too Late Submission",
          description: "Submitted after deadline.",
        });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe("SUBMISSION_DEADLINE_EXPIRED");
    });

    it("edits to a submission are rejected when the deadline has passed", async () => {
      // Create a submission in the expired deadline event directly
      const lateUser = await helperCreateUser("Late Editor", `late_edit_${ts}@example.com`);
      const lateTeam = await prisma.team.create({
        data: {
          eventId: expiredDeadlineEventId,
          name: `Late Edit Team ${ts}`,
        },
      });

      await prisma.teamMember.create({
        data: {
          teamId: lateTeam.id,
          userId: lateUser.user.id,
          eventId: expiredDeadlineEventId,
          role: "LEADER",
        },
      });

      const lateTrack = await prisma.track.create({
        data: {
          eventId: expiredDeadlineEventId,
          name: `Late Edit Track ${ts}`,
        },
      });

      const lateSub = await prisma.submission.create({
        data: {
          eventId: expiredDeadlineEventId,
          teamId: lateTeam.id,
          trackId: lateTrack.id,
          projectName: "Old Submission",
          description: "Created before deadline in DB.",
          isDraft: true,
          status: "DRAFT",
        },
      });

      // Attempt to edit after deadline
      const res = await request(app)
        .patch(`/api/events/${expiredDeadlineEventId}/submissions/${lateSub.id}`)
        .set("Cookie", lateUser.cookie)
        .send({
          projectName: "Post-Deadline Edit Attempt",
        });

      expect(res.status).toBe(422);
      expect(res.body.error).toBe("SUBMISSION_DEADLINE_EXPIRED");
    });
  });
});
