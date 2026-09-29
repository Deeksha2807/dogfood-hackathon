import { describe, it, expect, beforeEach } from "vitest";
import { MOCK_USERS } from "../services/mockData";

describe("Role and Permission Rules", () => {
  it("should recognize Super Admin permissions", () => {
    const admin = MOCK_USERS[0];
    expect(admin.globalRole).toBe("SUPER_ADMIN");
    expect(admin.isActive).toBe(true);
  });

  it("should identify event organizer role", () => {
    const organizer = MOCK_USERS[1];
    const isOrganizer =
      organizer.globalRole === "SUPER_ADMIN" ||
      organizer.email.includes("organizer") ||
      organizer.eventRoles?.some((r) => r.role === "ORGANIZER");
    expect(isOrganizer).toBe(true);
  });

  it("should identify judge role", () => {
    const judge = MOCK_USERS[2];
    const isJudge =
      judge.email.includes("judge") ||
      judge.eventRoles?.some((r) => r.role === "JUDGE");
    expect(isJudge).toBe(true);
  });

  it("should identify participant role", () => {
    const participant = MOCK_USERS[4];
    expect(participant.email).toContain("alice@hackathon.local");
    const isJudge = participant.email.includes("judge");
    expect(isJudge).toBe(false);
  });
});
