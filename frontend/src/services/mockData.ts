import { Event, User, Track, Prize, Team, Submission, Rubric, JudgeAssignment, FinalResult, ProjectComment } from "../types";

export const MOCK_EVENT_ID = "00000000-0000-4000-8000-000000000001";

export const MOCK_USERS: User[] = [
  {
    id: "u-admin-1",
    email: "admin@hackathon.local",
    name: "System Administrator",
    globalRole: "SUPER_ADMIN",
    isActive: true,
  },
  {
    id: "u-organizer-1",
    email: "organizer@hackathon.local",
    name: "Elena Vance (Organizer)",
    globalRole: "USER",
    isActive: true,
    eventRoles: [{ eventId: MOCK_EVENT_ID, role: "ORGANIZER" }],
  },
  {
    id: "u-judge-1",
    email: "judge1@hackathon.local",
    name: "Dr. Marcus Brody (Judge 1)",
    globalRole: "USER",
    isActive: true,
    eventRoles: [{ eventId: MOCK_EVENT_ID, role: "JUDGE" }],
  },
  {
    id: "u-judge-2",
    email: "judge2@hackathon.local",
    name: "Dr. Sarah Chen (Judge 2)",
    globalRole: "USER",
    isActive: true,
    eventRoles: [{ eventId: MOCK_EVENT_ID, role: "JUDGE" }],
  },
  {
    id: "u-alice-1",
    email: "alice@hackathon.local",
    name: "Alice Johnson (Participant)",
    globalRole: "USER",
    isActive: true,
    eventRoles: [{ eventId: MOCK_EVENT_ID, role: "PARTICIPANT" }],
  },
  {
    id: "u-bob-1",
    email: "bob@hackathon.local",
    name: "Bob Smith (Participant)",
    globalRole: "USER",
    isActive: true,
    eventRoles: [{ eventId: MOCK_EVENT_ID, role: "PARTICIPANT" }],
  },
];

export const MOCK_TRACKS: Track[] = [
  {
    id: "00000000-0000-4000-8000-000000000011",
    eventId: MOCK_EVENT_ID,
    name: "AI & Autonomous Agents",
    description: "Build cutting-edge multi-agent systems, autonomous coders, or neural workflow automation tools.",
    criteria: "Autonomy, Tool-use capabilities, LLM integration, Accuracy",
  },
  {
    id: "00000000-0000-4000-8000-000000000012",
    eventId: MOCK_EVENT_ID,
    name: "Developer Tooling & Infrastructure",
    description: "Innovate developer ergonomics, CI/CD speed, runtime performance, and observability pipelines.",
    criteria: "Developer experience, Reliability, Scalability, Usability",
  },
  {
    id: "00000000-0000-4000-8000-000000000013",
    eventId: MOCK_EVENT_ID,
    name: "Open Source & Social Impact",
    description: "Open collaboration tools, accessibility helpers, and public good software for global creators.",
    criteria: "Community impact, Open standards, Accessibility, Documentation",
  },
];

export const MOCK_PRIZES: Prize[] = [
  {
    id: "p-1",
    eventId: MOCK_EVENT_ID,
    name: "Grand Champion (1st Place)",
    description: "Highest overall normalized score across all tracks.",
    amount: 10000,
    rank: 1,
  },
  {
    id: "p-2",
    eventId: MOCK_EVENT_ID,
    name: "Runner Up (2nd Place)",
    description: "Second highest normalized score across all tracks.",
    amount: 5000,
    rank: 2,
  },
  {
    id: "p-3",
    eventId: MOCK_EVENT_ID,
    name: "Best Autonomous Agent",
    description: "Top scoring project in the AI & Autonomous Agents track.",
    amount: 3000,
    rank: 3,
  },
];

export const MOCK_EVENT: Event = {
  id: MOCK_EVENT_ID,
  name: "Autonomous AI & Developer Hackathon 2026",
  description: "A premier 48-hour global hackathon focused on autonomous agent workflows, developer tooling, and intelligent systems.",
  status: "ACTIVE",
  startDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
  submissionDeadline: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
  judgingDeadline: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
  maxTeamSize: 4,
  resultsPublished: false,
  tracks: MOCK_TRACKS,
  prizes: MOCK_PRIZES,
  _count: {
    teams: 14,
    submissions: 10,
  },
};

export const MOCK_TEAMS: Team[] = [
  {
    id: "00000000-0000-4000-8000-000000000021",
    eventId: MOCK_EVENT_ID,
    name: "Team AlphaForge",
    inviteCode: "ALPHA-2026-X9",
    maxMembers: 4,
    createdAt: new Date().toISOString(),
    members: [
      {
        id: "tm-1",
        teamId: "00000000-0000-4000-8000-000000000021",
        userId: "u-alice-1",
        role: "LEADER",
        joinedAt: new Date().toISOString(),
        user: { id: "u-alice-1", name: "Alice Johnson", email: "alice@hackathon.local" },
      },
      {
        id: "tm-2",
        teamId: "00000000-0000-4000-8000-000000000021",
        userId: "u-bob-1",
        role: "MEMBER",
        joinedAt: new Date().toISOString(),
        user: { id: "u-bob-1", name: "Bob Smith", email: "bob@hackathon.local" },
      },
    ],
  },
  {
    id: "00000000-0000-4000-8000-000000000022",
    eventId: MOCK_EVENT_ID,
    name: "Neural Nexus Devs",
    inviteCode: "NEXUS-882-QK",
    maxMembers: 4,
    createdAt: new Date().toISOString(),
    members: [
      {
        id: "tm-3",
        teamId: "00000000-0000-4000-8000-000000000022",
        userId: "u-carol-1",
        role: "LEADER",
        joinedAt: new Date().toISOString(),
        user: { id: "u-carol-1", name: "Carol Williams", email: "carol@hackathon.local" },
      },
    ],
  },
];

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: "00000000-0000-4000-8000-000000000031",
    eventId: MOCK_EVENT_ID,
    teamId: "00000000-0000-4000-8000-000000000021",
    trackId: "00000000-0000-4000-8000-000000000011",
    projectName: "AgentForge AutoPilot",
    tagline: "Autonomous multi-agent orchestration for end-to-end fullstack code generation and self-healing tests.",
    description: "AgentForge AutoPilot creates specialized agent teams that inspect codebases, write unit tests, verify builds, and deploy live containers with zero human intervention.",
    repoUrl: "https://github.com/hackforge/agent-autopilot",
    demoUrl: "https://agentforge-demo.vercel.app",
    videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    isDraft: false,
    status: "SUBMITTED",
    submittedAt: new Date().toISOString(),
    track: MOCK_TRACKS[0],
    team: MOCK_TEAMS[0],
    voteCount: 42,
  },
  {
    id: "00000000-0000-4000-8000-000000000032",
    eventId: MOCK_EVENT_ID,
    teamId: "00000000-0000-4000-8000-000000000022",
    trackId: "00000000-0000-4000-8000-000000000012",
    projectName: "DevShield Sentinel",
    tagline: "Real-time AI static analysis and vulnerability patching for CI/CD pipelines.",
    description: "DevShield scans every Git pull request for zero-day exploits, semantic logic bugs, and memory leaks, providing auto-generated PR fixes in seconds.",
    repoUrl: "https://github.com/neuralnexus/devshield",
    demoUrl: "https://devshield-live.io",
    videoUrl: "https://youtube.com/watch?v=demo-video",
    isDraft: false,
    status: "SUBMITTED",
    submittedAt: new Date().toISOString(),
    track: MOCK_TRACKS[1],
    team: MOCK_TEAMS[1],
    voteCount: 38,
  },
];

export const MOCK_RUBRIC: Rubric = {
  id: "00000000-0000-4000-8000-000000000041",
  eventId: MOCK_EVENT_ID,
  name: "Official HackForge 5-Criteria Judging Rubric",
  description: "Weighted evaluation engine calibrated across innovation, technical execution, real-world impact, user experience, and presentation.",
  minScore: 0,
  maxScore: 100,
  criteria: [
    {
      id: "00000000-0000-4000-8000-000000000051",
      rubricId: "00000000-0000-4000-8000-000000000041",
      name: "Innovation & Originality",
      description: "Novelty of solution, out-of-the-box thinking, uniqueness of competitive angle.",
      weight: 0.25,
      maxScore: 25,
    },
    {
      id: "00000000-0000-4000-8000-000000000052",
      rubricId: "00000000-0000-4000-8000-000000000041",
      name: "Technical Execution & Architecture",
      description: "Architectural robustness, effective technology stack, code cleanliness, and system engineering.",
      weight: 0.25,
      maxScore: 25,
    },
    {
      id: "00000000-0000-4000-8000-000000000053",
      rubricId: "00000000-0000-4000-8000-000000000041",
      name: "Real-World Impact",
      description: "Market viability, depth of problem solved, commercial/social deployment potential.",
      weight: 0.20,
      maxScore: 20,
    },
    {
      id: "00000000-0000-4000-8000-000000000054",
      rubricId: "00000000-0000-4000-8000-000000000041",
      name: "User Experience (UX)",
      description: "Intuitive flow, polished aesthetic, accessibility compliance, and responsiveness.",
      weight: 0.15,
      maxScore: 15,
    },
    {
      id: "00000000-0000-4000-8000-000000000055",
      rubricId: "00000000-0000-4000-8000-000000000041",
      name: "Presentation & Demo",
      description: "Clarity of video walkthrough, documentation completeness, and live demo reliability.",
      weight: 0.15,
      maxScore: 15,
    },
  ],
};

export const MOCK_JUDGE_ASSIGNMENTS: JudgeAssignment[] = [
  // Judge 1 (Dr. Marcus Brody) assignments
  {
    id: "00000000-0000-4000-8000-000000000061",
    eventId: MOCK_EVENT_ID,
    judgeId: "u-judge-1",
    submissionId: "00000000-0000-4000-8000-000000000031",
    status: "COMPLETED",
    assignedById: "u-organizer-1",
    assignedAt: new Date().toISOString(),
    submission: MOCK_SUBMISSIONS[0],
    judge: MOCK_USERS[2],
    evaluation: {
      id: "00000000-0000-4000-8000-000000000071",
      assignmentId: "00000000-0000-4000-8000-000000000061",
      judgeId: "u-judge-1",
      submissionId: "00000000-0000-4000-8000-000000000031",
      totalRawScore: 95.0,
      normalizedScore: 96.5,
      feedback: "Outstanding multi-agent architecture and very responsive demo. Exceptionally high technical rigor and clear presentation!",
      isDraft: false,
      submittedAt: new Date().toISOString(),
      scores: [
        { criterionId: "00000000-0000-4000-8000-000000000051", score: 24 }, // Innovation (max 25)
        { criterionId: "00000000-0000-4000-8000-000000000052", score: 24.5 }, // Technical (max 25)
        { criterionId: "00000000-0000-4000-8000-000000000053", score: 18.5 }, // Impact (max 20)
        { criterionId: "00000000-0000-4000-8000-000000000054", score: 14 }, // UX (max 15)
        { criterionId: "00000000-0000-4000-8000-000000000055", score: 14 }, // Presentation (max 15)
      ],
    },
  },
  {
    id: "00000000-0000-4000-8000-000000000063",
    eventId: MOCK_EVENT_ID,
    judgeId: "u-judge-1",
    submissionId: "00000000-0000-4000-8000-000000000032",
    status: "PENDING",
    assignedById: "u-organizer-1",
    assignedAt: new Date().toISOString(),
    submission: MOCK_SUBMISSIONS[1],
    judge: MOCK_USERS[2],
    evaluation: null,
  },
  // Judge 2 (Dr. Sarah Chen) assignments
  {
    id: "00000000-0000-4000-8000-000000000062",
    eventId: MOCK_EVENT_ID,
    judgeId: "u-judge-2",
    submissionId: "00000000-0000-4000-8000-000000000031",
    status: "PENDING",
    assignedById: "u-organizer-1",
    assignedAt: new Date().toISOString(),
    submission: MOCK_SUBMISSIONS[0],
    judge: MOCK_USERS[3],
    evaluation: null,
  },
  {
    id: "00000000-0000-4000-8000-000000000064",
    eventId: MOCK_EVENT_ID,
    judgeId: "u-judge-2",
    submissionId: "00000000-0000-4000-8000-000000000032",
    status: "COMPLETED",
    assignedById: "u-organizer-1",
    assignedAt: new Date().toISOString(),
    submission: MOCK_SUBMISSIONS[1],
    judge: MOCK_USERS[3],
    evaluation: {
      id: "00000000-0000-4000-8000-000000000072",
      assignmentId: "00000000-0000-4000-8000-000000000064",
      judgeId: "u-judge-2",
      submissionId: "00000000-0000-4000-8000-000000000032",
      totalRawScore: 90.5,
      normalizedScore: 92.0,
      feedback: "Great real-time vulnerability scanner. High technical utility for developer infrastructure and pipelines.",
      isDraft: false,
      submittedAt: new Date().toISOString(),
      scores: [
        { criterionId: "00000000-0000-4000-8000-000000000051", score: 22 }, // Innovation (max 25)
        { criterionId: "00000000-0000-4000-8000-000000000052", score: 23 }, // Technical (max 25)
        { criterionId: "00000000-0000-4000-8000-000000000053", score: 18 }, // Impact (max 20)
        { criterionId: "00000000-0000-4000-8000-000000000054", score: 13.5 }, // UX (max 15)
        { criterionId: "00000000-0000-4000-8000-000000000055", score: 14 }, // Presentation (max 15)
      ],
    },
  },
];

export const MOCK_FINAL_RESULTS: FinalResult[] = [
  {
    submissionId: "00000000-0000-4000-8000-000000000031",
    projectName: "AgentForge AutoPilot",
    tagline: "Autonomous multi-agent orchestration for end-to-end fullstack code generation.",
    teamName: "Team AlphaForge",
    trackName: "AI & Autonomous Agents",
    judgeCount: 2,
    rawScoreAvg: 95.0,
    normalizedScore: 95.2,
    finalScore: 95.2,
    rank: 1,
    status: "SUBMITTED",
    criteriaScores: {
      innovation: 23.5, // out of 25 (94%)
      technical: 24.5,  // out of 25 (98%)
      impact: 18.5,     // out of 20 (92.5%)
      ux: 14.0,         // out of 15 (93.3%)
      presentation: 14.5, // out of 15 (96.7%)
    },
  },
  {
    submissionId: "00000000-0000-4000-8000-000000000032",
    projectName: "DevShield Sentinel",
    tagline: "Real-time AI static analysis and vulnerability patching for CI/CD pipelines.",
    teamName: "Neural Nexus Devs",
    trackName: "Developer Tooling & Infrastructure",
    judgeCount: 2,
    rawScoreAvg: 88.5,
    normalizedScore: 89.4,
    finalScore: 89.4,
    rank: 2,
    status: "SUBMITTED",
    criteriaScores: {
      innovation: 21.5, // out of 25 (86%)
      technical: 22.5,  // out of 25 (90%)
      impact: 17.5,     // out of 20 (87.5%)
      ux: 13.5,         // out of 15 (90%)
      presentation: 13.5, // out of 15 (90%)
    },
  },
];

export const MOCK_COMMENTS: Record<string, ProjectComment[]> = {
  "00000000-0000-4000-8000-000000000031": [
    {
      id: "c-1",
      submissionId: "00000000-0000-4000-8000-000000000031",
      authorName: "Sarah Dev",
      content: "The latency for test generation was remarkably low! How are you handling sandbox isolation?",
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    },
    {
      id: "c-2",
      submissionId: "00000000-0000-4000-8000-000000000031",
      authorName: "Alex R.",
      content: "Voted! This is hands down the most complete project in the AI track.",
      createdAt: new Date(Date.now() - 1800 * 1000).toISOString(),
    },
  ],
};
