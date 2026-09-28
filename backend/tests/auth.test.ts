import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app";
import { prisma } from "../src/config/database";
import { config } from "../src/config/env";
import { EventRoleType } from "@prisma/client";

describe("Phase 3 Authentication, Sessions & Event RBAC", () => {
  const timestamp = Date.now();
  const testUser = {
    email: `test_auth_${timestamp}@example.com`,
    name: "Test Auth User",
    password: "Password123!Secure",
  };

  const otherUser = {
    email: `other_auth_${timestamp}@example.com`,
    name: "Other User",
    password: "Password123!Secure",
  };

  let testEventId: string;
  let registeredUserId: string;
  let sessionCookie: string;

  beforeAll(async () => {
    // Create an event for testing event-scoped RBAC
    const event = await prisma.event.create({
      data: {
        name: `Auth Test Event ${timestamp}`,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 3),
        submissionDeadline: new Date(Date.now() + 86400000),
        judgingDeadline: new Date(Date.now() + 86400000 * 2),
      },
    });
    testEventId = event.id;
  });

  afterAll(async () => {
    // Clean up created test data
    try {
      if (testEventId) {
        await prisma.eventRole.deleteMany({ where: { eventId: testEventId } });
        await prisma.event.delete({ where: { id: testEventId } });
      }
      await prisma.session.deleteMany({
        where: {
          user: {
            email: {
              in: [testUser.email, otherUser.email],
            },
          },
        },
      });
      await prisma.user.deleteMany({
        where: {
          email: {
            in: [testUser.email, otherUser.email],
          },
        },
      });
    } catch {
      // Ignore cleanup error if already deleted
    }
  });

  // 1. Registration succeeds
  it("registration succeeds with valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user.globalRole).toBe("USER");
    expect(res.body.user.passwordHash).toBeUndefined(); // Never return password hash

    registeredUserId = res.body.user.id;
  });

  // 2. Duplicate email is rejected safely
  it("duplicate email is rejected safely with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: testUser.email.toUpperCase(), // Test case-insensitive normalization
        name: "Duplicate Person",
        password: "DifferentPassword123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("EMAIL_ALREADY_EXISTS");
  });

  // 3. Login succeeds with correct password
  it("login succeeds with correct password and sets session cookie", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.passwordHash).toBeUndefined();

    // Verify Set-Cookie header contains session token
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    const cookieHeader = Array.isArray(cookies) ? cookies.join("; ") : cookies;
    expect(cookieHeader).toContain(config.sessionCookieName);
    expect(cookieHeader).toContain("HttpOnly");

    // Save session cookie for subsequent tests
    sessionCookie = (cookies as string[])[0].split(";")[0];
  });

  // 4. Login fails with wrong password
  it("login fails with wrong password returning 401 without leaking info", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "WrongPassword999!",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("INVALID_CREDENTIALS");
    expect(res.body.message).toBe("Invalid email or password.");
  });

  // 5. Unauthenticated /me is rejected
  it("unauthenticated GET /api/auth/me is rejected with 401", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("UNAUTHORIZED");
  });

  // 6. Authenticated /me succeeds
  it("authenticated GET /api/auth/me succeeds with session cookie", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBe(registeredUserId);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  // 7. Event role authorization works
  it("event role authorization works when user holds a role in the event", async () => {
    // Assign user as an ORGANIZER for testEventId
    await prisma.eventRole.create({
      data: {
        eventId: testEventId,
        userId: registeredUserId,
        role: EventRoleType.ORGANIZER,
      },
    });

    const res = await request(app)
      .get(`/api/events/${testEventId}/access`)
      .set("Cookie", sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.eventId).toBe(testEventId);
    expect(res.body.userId).toBe(registeredUserId);
    expect(res.body.role).toBe("ORGANIZER");
  });

  // 8. User without an event role receives 403
  it("user without an event role receives 403 Forbidden", async () => {
    // Register another user who has no role in testEventId
    const regRes = await request(app)
      .post("/api/auth/register")
      .send(otherUser);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: otherUser.email,
        password: otherUser.password,
      });

    const otherCookies = loginRes.headers["set-cookie"] as string[];
    const otherCookie = otherCookies[0].split(";")[0];

    const res = await request(app)
      .get(`/api/events/${testEventId}/access`)
      .set("Cookie", otherCookie);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("FORBIDDEN");
  });

  // 9. Logout invalidates the session
  it("logout invalidates the session and clears cookie", async () => {
    const logoutRes = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", sessionCookie);

    expect(logoutRes.status).toBe(200);

    // After logout, accessing /me with the old session cookie must be rejected with 401
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Cookie", sessionCookie);

    expect(meRes.status).toBe(401);
    expect(meRes.body.error).toBe("UNAUTHORIZED");
  });
});
