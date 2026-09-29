import { Submission, ProjectComment } from "../types";
import { MOCK_SUBMISSIONS, MOCK_COMMENTS } from "./mockData";

// Local storage keys for client side community voting persistence
const VOTES_KEY = "hackathon_community_votes";
const COMMENTS_KEY = "hackathon_community_comments";

export const votingService = {
  async getPublicProjects(eventId: string): Promise<Submission[]> {
    // Return submissions with vote counts
    const storedVotes = JSON.parse(localStorage.getItem(VOTES_KEY) || "{}");
    return MOCK_SUBMISSIONS.filter((s) => s.eventId === eventId && !s.isDraft).map((s) => ({
      ...s,
      voteCount: (s.voteCount || 0) + (storedVotes[s.id] ? 1 : 0),
    }));
  },

  async vote(submissionId: string, voterId: string): Promise<{ success: boolean; voteCount: number }> {
    const storedVotes = JSON.parse(localStorage.getItem(VOTES_KEY) || "{}");
    const userVotes = JSON.parse(localStorage.getItem(`${VOTES_KEY}_user_${voterId}`) || "{}");

    // Rate-limit / Duplicate Vote check
    if (userVotes[submissionId]) {
      const error: any = new Error("Duplicate vote rejected: You have already cast your community vote for this project.");
      error.code = "DUPLICATE_VOTE_REJECTED";
      error.statusCode = 429;
      throw error;
    }

    userVotes[submissionId] = true;
    storedVotes[submissionId] = (storedVotes[submissionId] || 0) + 1;

    localStorage.setItem(VOTES_KEY, JSON.stringify(storedVotes));
    localStorage.setItem(`${VOTES_KEY}_user_${voterId}`, JSON.stringify(userVotes));

    const baseSubmission = MOCK_SUBMISSIONS.find((s) => s.id === submissionId);
    const totalCount = (baseSubmission?.voteCount || 0) + storedVotes[submissionId];

    return { success: true, voteCount: totalCount };
  },

  async hasVoted(submissionId: string, voterId: string): Promise<boolean> {
    const userVotes = JSON.parse(localStorage.getItem(`${VOTES_KEY}_user_${voterId}`) || "{}");
    return !!userVotes[submissionId];
  },

  async getComments(submissionId: string): Promise<ProjectComment[]> {
    const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || "{}");
    const custom = allComments[submissionId] || [];
    const defaults = MOCK_COMMENTS[submissionId] || [];
    return [...defaults, ...custom];
  },

  async addComment(submissionId: string, authorName: string, content: string): Promise<ProjectComment> {
    if (!content.trim()) {
      throw new Error("Comment cannot be empty.");
    }
    const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || "{}");
    const newComment: ProjectComment = {
      id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      submissionId,
      authorName: authorName || "Anonymous Hacker",
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    allComments[submissionId] = [...(allComments[submissionId] || []), newComment];
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
    return newComment;
  },
};
