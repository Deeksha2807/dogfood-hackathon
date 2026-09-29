/**
 * DevPulse Centralized API Service Layer
 * Supports both real backend HTTP API endpoints and an interactive mock mode fallback.
 * Configurable via `import.meta.env.VITE_API_BASE_URL` or window.localStorage.
 */

import {
  initialEvents,
  initialUsers,
  initialJudges,
  initialSubmissions,
  initialCommunityVoting
} from './mockData';

// API Configuration State
const CONFIG = {
  baseUrl: import.meta.env?.VITE_API_BASE_URL || 'https://api.devpulse.internal/v1',
  // Default to mock mode if VITE_USE_MOCK is 'true' or undefined in local dev environment
  useMock: localStorage.getItem('DEV_PULSE_USE_MOCK') !== 'false',
  simulatedDelayMs: 400,
  forceError: false // Can be toggled for testing error UI states
};

// In-memory state store for mock persistence during session
let mockDb = {
  events: [...initialEvents],
  users: [...initialUsers],
  judges: [...initialJudges],
  submissions: [...initialSubmissions],
  voting: { ...initialCommunityVoting }
};

/**
 * Helper: Delay execution to simulate network latency in mock mode
 */
const delay = (ms = CONFIG.simulatedDelayMs) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper: Generic HTTP fetch wrapper with error handling
 */
async function httpFetch(endpoint, options = {}) {
  const url = `${CONFIG.baseUrl}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, err);
    throw err;
  }
}

/**
 * Global Configuration Helpers
 */
export const apiConfig = {
  getUseMock: () => CONFIG.useMock,
  setUseMock: (val) => {
    CONFIG.useMock = Boolean(val);
    localStorage.setItem('DEV_PULSE_USE_MOCK', String(val));
  },
  getBaseUrl: () => CONFIG.baseUrl,
  setBaseUrl: (url) => { CONFIG.baseUrl = url; },
  setForceError: (val) => { CONFIG.forceError = Boolean(val); },
  resetMockDb: () => {
    mockDb = {
      events: [...initialEvents],
      users: [...initialUsers],
      judges: [...initialJudges],
      submissions: [...initialSubmissions],
      voting: { ...initialCommunityVoting }
    };
  }
};

/**
 * --------------------------------------------------------------------------
 * 1. EVENTS API CONTRACT & IMPLEMENTATION
 * --------------------------------------------------------------------------
 * Endpoints:
 * - GET /events (Query: status, category, search)
 * - GET /events/:id
 * - POST /events (Body: Event payload)
 * - PUT /events/:id (Body: Event updates)
 * - DELETE /events/:id
 * - POST /events/:id/register (Body: { userId })
 */
export const eventsApi = {
  async getAll(params = {}) {
    if (CONFIG.useMock) {
      await delay();
      if (CONFIG.forceError) {
        throw new Error("Simulated Backend Error: Unable to fetch hackathon events.");
      }
      let result = [...mockDb.events];

      if (params.status && params.status !== 'All') {
        result = result.filter(e => e.status.toLowerCase() === params.status.toLowerCase());
      }
      if (params.category && params.category !== 'All') {
        result = result.filter(e => e.category === params.category);
      }
      if (params.search) {
        const query = params.search.toLowerCase();
        result = result.filter(e => 
          e.title.toLowerCase().includes(query) ||
          e.description.toLowerCase().includes(query) ||
          e.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      return { success: true, data: result, total: result.length };
    }

    const queryString = new URLSearchParams(params).toString();
    return httpFetch(`/events${queryString ? `?${queryString}` : ''}`);
  },

  async getById(id) {
    if (CONFIG.useMock) {
      await delay();
      const event = mockDb.events.find(e => e.id === id);
      if (!event) throw new Error(`Event with ID ${id} not found.`);
      return { success: true, data: event };
    }
    return httpFetch(`/events/${id}`);
  },

  async create(eventData) {
    if (CONFIG.useMock) {
      await delay();
      const newEvent = {
        id: `evt-${Date.now()}`,
        status: "Upcoming",
        registeredCount: 0,
        submissionsCount: 0,
        isRegistered: false,
        tags: eventData.tags || ["Hackathon"],
        ...eventData
      };
      mockDb.events.unshift(newEvent);
      return { success: true, data: newEvent, message: "Event created successfully." };
    }
    return httpFetch('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  async update(id, updates) {
    if (CONFIG.useMock) {
      await delay();
      const index = mockDb.events.findIndex(e => e.id === id);
      if (index === -1) throw new Error("Event not found");
      mockDb.events[index] = { ...mockDb.events[index], ...updates };
      return { success: true, data: mockDb.events[index] };
    }
    return httpFetch(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async delete(id) {
    if (CONFIG.useMock) {
      await delay();
      mockDb.events = mockDb.events.filter(e => e.id !== id);
      return { success: true, id, message: "Event deleted successfully." };
    }
    return httpFetch(`/events/${id}`, { method: 'DELETE' });
  },

  async registerParticipant(eventId, userId = "usr-02") {
    if (CONFIG.useMock) {
      await delay();
      const event = mockDb.events.find(e => e.id === eventId);
      if (!event) throw new Error("Event not found");
      event.isRegistered = !event.isRegistered;
      event.registeredCount += event.isRegistered ? 1 : -1;
      return {
        success: true,
        isRegistered: event.isRegistered,
        registeredCount: event.registeredCount,
        message: event.isRegistered ? "Successfully registered for event!" : "Registration cancelled."
      };
    }
    return httpFetch(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }
};

/**
 * --------------------------------------------------------------------------
 * 2. USERS API CONTRACT & IMPLEMENTATION
 * --------------------------------------------------------------------------
 * Endpoints:
 * - GET /users
 * - GET /users/:id
 * - POST /auth/login (Body: { email })
 * - PATCH /users/:id/role (Body: { role })
 */
export const usersApi = {
  async getAll() {
    if (CONFIG.useMock) {
      await delay();
      return { success: true, data: mockDb.users };
    }
    return httpFetch('/users');
  },

  async getById(id) {
    if (CONFIG.useMock) {
      await delay();
      const user = mockDb.users.find(u => u.id === id);
      if (!user) throw new Error("User not found");
      return { success: true, data: user };
    }
    return httpFetch(`/users/${id}`);
  },

  async updateRole(id, role) {
    if (CONFIG.useMock) {
      await delay();
      const user = mockDb.users.find(u => u.id === id);
      if (!user) throw new Error("User not found");
      user.role = role;
      return { success: true, data: user };
    }
    return httpFetch(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
  }
};

/**
 * --------------------------------------------------------------------------
 * 3. JUDGES API CONTRACT & IMPLEMENTATION
 * --------------------------------------------------------------------------
 * Endpoints:
 * - GET /judges
 * - GET /judges/:id/assignments
 * - POST /judges/scores (Body: { submissionId, judgeId, criteriaScores, feedback })
 * - GET /judges/rubrics
 */
export const judgesApi = {
  async getAll() {
    if (CONFIG.useMock) {
      await delay();
      return { success: true, data: mockDb.judges };
    }
    return httpFetch('/judges');
  },

  async getAssignments(judgeId) {
    if (CONFIG.useMock) {
      await delay();
      const judge = mockDb.judges.find(j => j.id === judgeId);
      const assigned = mockDb.submissions.filter(s => judge?.assignedSubmissions?.includes(s.id));
      return { success: true, data: assigned };
    }
    return httpFetch(`/judges/${judgeId}/assignments`);
  },

  async submitEvaluation({ submissionId, judgeId, criteriaScores, feedback }) {
    if (CONFIG.useMock) {
      await delay();
      const sub = mockDb.submissions.find(s => s.id === submissionId);
      if (sub) {
        const avgScore = Object.values(criteriaScores).reduce((a, b) => a + b, 0) / Object.keys(criteriaScores).length;
        sub.score = Math.round(avgScore * 10) / 10;
        sub.status = "Evaluated";
      }
      return { success: true, message: "Evaluation submitted successfully!", submissionId };
    }
    return httpFetch('/judges/scores', {
      method: 'POST',
      body: JSON.stringify({ submissionId, judgeId, criteriaScores, feedback })
    });
  }
};

/**
 * --------------------------------------------------------------------------
 * 4. SUBMISSIONS API CONTRACT & IMPLEMENTATION
 * --------------------------------------------------------------------------
 * Endpoints:
 * - GET /submissions (Query: eventId, category)
 * - GET /submissions/:id
 * - POST /submissions (Body: Submission payload)
 * - PATCH /submissions/:id/status (Body: { status })
 */
export const submissionsApi = {
  async getAll(params = {}) {
    if (CONFIG.useMock) {
      await delay();
      let list = [...mockDb.submissions];
      if (params.eventId) list = list.filter(s => s.eventId === params.eventId);
      if (params.category && params.category !== 'All') list = list.filter(s => s.category === params.category);
      return { success: true, data: list, total: list.length };
    }
    const queryString = new URLSearchParams(params).toString();
    return httpFetch(`/submissions${queryString ? `?${queryString}` : ''}`);
  },

  async getById(id) {
    if (CONFIG.useMock) {
      await delay();
      const sub = mockDb.submissions.find(s => s.id === id);
      if (!sub) throw new Error("Submission not found");
      return { success: true, data: sub };
    }
    return httpFetch(`/submissions/${id}`);
  },

  async create(data) {
    if (CONFIG.useMock) {
      await delay();
      const newSub = {
        id: `sub-${Date.now()}`,
        status: "Under Review",
        score: 0,
        votes: 0,
        createdAt: new Date().toISOString(),
        ...data
      };
      mockDb.submissions.unshift(newSub);

      // Increment submission count on event
      const event = mockDb.events.find(e => e.id === data.eventId);
      if (event) event.submissionsCount += 1;

      return { success: true, data: newSub, message: "Project submitted successfully!" };
    }
    return httpFetch('/submissions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

/**
 * --------------------------------------------------------------------------
 * 5. COMMUNITY VOTING API CONTRACT & IMPLEMENTATION
 * --------------------------------------------------------------------------
 * Endpoints:
 * - GET /voting/leaderboard (Query: eventId)
 * - POST /voting/vote (Body: { submissionId, userId })
 * - GET /voting/user-votes/:userId
 */
export const votingApi = {
  async getLeaderboard(eventId = "evt-101") {
    if (CONFIG.useMock) {
      await delay();
      const sorted = [...mockDb.submissions].sort((a, b) => b.votes - a.votes);
      const leaderboard = sorted.map((item, idx) => ({
        submissionId: item.id,
        title: item.title,
        teamName: item.teamName,
        votes: item.votes,
        rank: idx + 1,
        category: item.category
      }));
      return {
        success: true,
        data: {
          eventId,
          totalVotesCast: sorted.reduce((acc, curr) => acc + curr.votes, 0),
          userVotedSubmissions: mockDb.voting.userVotedSubmissions,
          leaderboard
        }
      };
    }
    return httpFetch(`/voting/leaderboard?eventId=${eventId}`);
  },

  async toggleVote(submissionId, userId = "usr-02") {
    if (CONFIG.useMock) {
      await delay();
      const sub = mockDb.submissions.find(s => s.id === submissionId);
      if (!sub) throw new Error("Submission not found");

      const hasVoted = mockDb.voting.userVotedSubmissions.includes(submissionId);
      if (hasVoted) {
        mockDb.voting.userVotedSubmissions = mockDb.voting.userVotedSubmissions.filter(id => id !== submissionId);
        sub.votes = Math.max(0, sub.votes - 1);
      } else {
        mockDb.voting.userVotedSubmissions.push(submissionId);
        sub.votes += 1;
      }

      return {
        success: true,
        voted: !hasVoted,
        newVoteCount: sub.votes,
        message: !hasVoted ? "Vote recorded!" : "Vote removed."
      };
    }
    return httpFetch('/voting/vote', {
      method: 'POST',
      body: JSON.stringify({ submissionId, userId })
    });
  }
};

// Export unified API object
export default {
  config: apiConfig,
  events: eventsApi,
  users: usersApi,
  judges: judgesApi,
  submissions: submissionsApi,
  voting: votingApi
};
