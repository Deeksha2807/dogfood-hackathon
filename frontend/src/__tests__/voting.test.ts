import { describe, it, expect, beforeEach } from "vitest";
import { votingService } from "../services/votingService";
import { MOCK_SUBMISSIONS, MOCK_EVENT_ID } from "../services/mockData";

describe("Voting Service & Anti-Duplicate Vote Protection", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should retrieve initial public projects with vote counts", async () => {
    const projects = await votingService.getPublicProjects(MOCK_EVENT_ID);
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0]).toHaveProperty("voteCount");
  });

  it("should record a valid community vote", async () => {
    const subId = MOCK_SUBMISSIONS[0].id;
    const voterId = "user-123";

    const res = await votingService.vote(subId, voterId);
    expect(res.success).toBe(true);
    expect(res.voteCount).toBe((MOCK_SUBMISSIONS[0].voteCount || 0) + 1);

    const hasVoted = await votingService.hasVoted(subId, voterId);
    expect(hasVoted).toBe(true);
  });

  it("should reject duplicate votes from the same user/token", async () => {
    const subId = MOCK_SUBMISSIONS[0].id;
    const voterId = "user-123";

    await votingService.vote(subId, voterId);

    // Attempt second vote for same submission
    await expect(votingService.vote(subId, voterId)).rejects.toThrow(
      "Duplicate vote rejected"
    );
  });

  it("should allow comments on project submissions", async () => {
    const subId = MOCK_SUBMISSIONS[0].id;
    const comment = await votingService.addComment(subId, "Alice", "Great architecture and speed!");

    expect(comment).toHaveProperty("id");
    expect(comment.authorName).toBe("Alice");
    expect(comment.content).toBe("Great architecture and speed!");

    const comments = await votingService.getComments(subId);
    expect(comments.some((c) => c.content === "Great architecture and speed!")).toBe(true);
  });
});
