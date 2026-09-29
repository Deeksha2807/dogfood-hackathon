import {
  PrismaClient,
  GlobalRole,
  EventRoleType,
  EventStatus,
  TeamRole,
  SubmissionStatus,
  JudgeInviteStatus,
  AssignmentStatus,
} from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

// Deterministic UUIDs for repeatable fixture seeding
export const SEED_CONSTANTS = {
  EVENT_ID: "00000000-0000-4000-8000-000000000001",
  TRACK_AI_ID: "00000000-0000-4000-8000-000000000011",
  TRACK_DEV_ID: "00000000-0000-4000-8000-000000000012",
  TEAM_ALPHA_ID: "00000000-0000-4000-8000-000000000021",
  TEAM_BETA_ID: "00000000-0000-4000-8000-000000000022",
  SUBMISSION_ALPHA_ID: "00000000-0000-4000-8000-000000000031",
  SUBMISSION_BETA_ID: "00000000-0000-4000-8000-000000000032",
  RUBRIC_ID: "00000000-0000-4000-8000-000000000041",
  CRITERION_TECH_ID: "00000000-0000-4000-8000-000000000051",
  CRITERION_INNO_ID: "00000000-0000-4000-8000-000000000052",
  CRITERION_IMPACT_ID: "00000000-0000-4000-8000-000000000053",
  ASSIGNMENT_J1_ALPHA_ID: "00000000-0000-4000-8000-000000000061",
  ASSIGNMENT_J2_ALPHA_ID: "00000000-0000-4000-8000-000000000062",
  ASSIGNMENT_J1_BETA_ID: "00000000-0000-4000-8000-000000000063",
  ASSIGNMENT_J2_BETA_ID: "00000000-0000-4000-8000-000000000064",
  EVALUATION_J1_ALPHA_ID: "00000000-0000-4000-8000-000000000071",
  EVALUATION_J2_ALPHA_ID: "00000000-0000-4000-8000-000000000072",
  DEFAULT_DEMO_PASSWORD: "Password123!",
};

async function main() {
  console.log("Starting idempotent fixture seed...");

  // 1. Password hash generation
  const passwordHash = await argon2.hash(SEED_CONSTANTS.DEFAULT_DEMO_PASSWORD, {
    type: argon2.argon2id,
  });

  // 2. Seed Users
  console.log("Seeding demo users...");
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@hackathon.local" },
    update: { name: "System Administrator", passwordHash, globalRole: GlobalRole.SUPER_ADMIN, isActive: true },
    create: {
      email: "admin@hackathon.local",
      name: "System Administrator",
      passwordHash,
      globalRole: GlobalRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  const organizerUser = await prisma.user.upsert({
    where: { email: "organizer@hackathon.local" },
    update: { name: "Elena Vance (Organizer)", passwordHash, globalRole: GlobalRole.USER, isActive: true },
    create: {
      email: "organizer@hackathon.local",
      name: "Elena Vance (Organizer)",
      passwordHash,
      globalRole: GlobalRole.USER,
      isActive: true,
    },
  });

  const judge1User = await prisma.user.upsert({
    where: { email: "judge1@hackathon.local" },
    update: { name: "Dr. Marcus Brody (Judge 1)", passwordHash, globalRole: GlobalRole.USER, isActive: true },
    create: {
      email: "judge1@hackathon.local",
      name: "Dr. Marcus Brody (Judge 1)",
      passwordHash,
      globalRole: GlobalRole.USER,
      isActive: true,
    },
  });

  const judge2User = await prisma.user.upsert({
    where: { email: "judge2@hackathon.local" },
    update: { name: "Dr. Sarah Chen (Judge 2)", passwordHash, globalRole: GlobalRole.USER, isActive: true },
    create: {
      email: "judge2@hackathon.local",
      name: "Dr. Sarah Chen (Judge 2)",
      passwordHash,
      globalRole: GlobalRole.USER,
      isActive: true,
    },
  });

  const participant1 = await prisma.user.upsert({
    where: { email: "alice@hackathon.local" },
    update: { name: "Alice Johnson (Participant)", passwordHash, globalRole: GlobalRole.USER, isActive: true },
    create: {
      email: "alice@hackathon.local",
      name: "Alice Johnson (Participant)",
      passwordHash,
      globalRole: GlobalRole.USER,
      isActive: true,
    },
  });

  const participant2 = await prisma.user.upsert({
    where: { email: "bob@hackathon.local" },
    update: { name: "Bob Smith (Participant)", passwordHash, globalRole: GlobalRole.USER, isActive: true },
    create: {
      email: "bob@hackathon.local",
      name: "Bob Smith (Participant)",
      passwordHash,
      globalRole: GlobalRole.USER,
      isActive: true,
    },
  });

  const participant3 = await prisma.user.upsert({
    where: { email: "carol@hackathon.local" },
    update: { name: "Carol Williams (Participant)", passwordHash, globalRole: GlobalRole.USER, isActive: true },
    create: {
      email: "carol@hackathon.local",
      name: "Carol Williams (Participant)",
      passwordHash,
      globalRole: GlobalRole.USER,
      isActive: true,
    },
  });

  // 3. Seed Event
  console.log("Seeding demo event...");
  const event = await prisma.event.upsert({
    where: { id: SEED_CONSTANTS.EVENT_ID },
    update: {
      name: "Autonomous AI & Developer Hackathon 2026",
      description: "A premier 48-hour hackathon focused on autonomous agent workflows, developer tooling, and intelligent systems.",
      status: EventStatus.ACTIVE,
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2026-10-01T00:00:00.000Z"),
      submissionDeadline: new Date("2026-09-29T23:59:59.000Z"),
      judgingDeadline: new Date("2026-09-30T23:59:59.000Z"),
      maxTeamSize: 4,
      resultsPublished: false,
    },
    create: {
      id: SEED_CONSTANTS.EVENT_ID,
      name: "Autonomous AI & Developer Hackathon 2026",
      description: "A premier 48-hour hackathon focused on autonomous agent workflows, developer tooling, and intelligent systems.",
      status: EventStatus.ACTIVE,
      startDate: new Date("2026-09-01T00:00:00.000Z"),
      endDate: new Date("2026-10-01T00:00:00.000Z"),
      submissionDeadline: new Date("2026-09-29T23:59:59.000Z"),
      judgingDeadline: new Date("2026-09-30T23:59:59.000Z"),
      maxTeamSize: 4,
      resultsPublished: false,
    },
  });

  // 4. Seed Event Roles
  console.log("Seeding event-scoped roles...");
  const rolesToSeed = [
    { userId: organizerUser.id, role: EventRoleType.ORGANIZER },
    { userId: judge1User.id, role: EventRoleType.JUDGE },
    { userId: judge2User.id, role: EventRoleType.JUDGE },
    { userId: participant1.id, role: EventRoleType.PARTICIPANT },
    { userId: participant2.id, role: EventRoleType.PARTICIPANT },
    { userId: participant3.id, role: EventRoleType.PARTICIPANT },
  ];

  for (const r of rolesToSeed) {
    await prisma.eventRole.upsert({
      where: {
        eventId_userId_role: {
          eventId: event.id,
          userId: r.userId,
          role: r.role,
        },
      },
      update: {},
      create: {
        eventId: event.id,
        userId: r.userId,
        role: r.role,
      },
    });
  }

  // 5. Seed Tracks
  console.log("Seeding tracks...");
  const trackAI = await prisma.track.upsert({
    where: {
      eventId_name: {
        eventId: event.id,
        name: "Autonomous Agents",
      },
    },
    update: {
      description: "Autonomous reasoning agents, multi-agent coordination, and real-time LLM workflows.",
    },
    create: {
      id: SEED_CONSTANTS.TRACK_AI_ID,
      eventId: event.id,
      name: "Autonomous Agents",
      description: "Autonomous reasoning agents, multi-agent coordination, and real-time LLM workflows.",
    },
  });

  const trackDev = await prisma.track.upsert({
    where: {
      eventId_name: {
        eventId: event.id,
        name: "Developer Infrastructure",
      },
    },
    update: {
      description: "Developer tooling, CI/CD pipelines, runtime observability, and automated diagnostics.",
    },
    create: {
      id: SEED_CONSTANTS.TRACK_DEV_ID,
      eventId: event.id,
      name: "Developer Infrastructure",
      description: "Developer tooling, CI/CD pipelines, runtime observability, and automated diagnostics.",
    },
  });

  // 6. Seed Teams & Members
  console.log("Seeding teams and memberships...");
  const teamAlpha = await prisma.team.upsert({
    where: {
      eventId_name: {
        eventId: event.id,
        name: "AgentOps Core",
      },
    },
    update: {
      trackId: trackAI.id,
    },
    create: {
      id: SEED_CONSTANTS.TEAM_ALPHA_ID,
      eventId: event.id,
      trackId: trackAI.id,
      name: "AgentOps Core",
    },
  });

  const teamBeta = await prisma.team.upsert({
    where: {
      eventId_name: {
        eventId: event.id,
        name: "DevPulse Labs",
      },
    },
    update: {
      trackId: trackDev.id,
    },
    create: {
      id: SEED_CONSTANTS.TEAM_BETA_ID,
      eventId: event.id,
      trackId: trackDev.id,
      name: "DevPulse Labs",
    },
  });

  // Memberships
  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: teamAlpha.id, userId: participant1.id } },
    update: { role: TeamRole.LEADER },
    create: { teamId: teamAlpha.id, userId: participant1.id, eventId: event.id, role: TeamRole.LEADER },
  });

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: teamAlpha.id, userId: participant2.id } },
    update: { role: TeamRole.MEMBER },
    create: { teamId: teamAlpha.id, userId: participant2.id, eventId: event.id, role: TeamRole.MEMBER },
  });

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: teamBeta.id, userId: participant3.id } },
    update: { role: TeamRole.LEADER },
    create: { teamId: teamBeta.id, userId: participant3.id, eventId: event.id, role: TeamRole.LEADER },
  });

  // 7. Seed Submissions
  console.log("Seeding submissions...");
  const submissionAlpha = await prisma.submission.upsert({
    where: { teamId: teamAlpha.id },
    update: {
      eventId: event.id,
      trackId: trackAI.id,
      projectName: "AgentFlow Orchestrator",
      tagline: "Autonomous multi-agent orchestration for distributed workflows",
      description: "AgentFlow is an open-source autonomous agent framework enabling complex task decomposition, state machine execution, and verifiable output logging.",
      repoUrl: "https://github.com/demo/agentflow",
      demoUrl: "https://agentflow.demo.local",
      isDraft: false,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date("2026-09-10T12:00:00.000Z"),
    },
    create: {
      id: SEED_CONSTANTS.SUBMISSION_ALPHA_ID,
      eventId: event.id,
      teamId: teamAlpha.id,
      trackId: trackAI.id,
      projectName: "AgentFlow Orchestrator",
      tagline: "Autonomous multi-agent orchestration for distributed workflows",
      description: "AgentFlow is an open-source autonomous agent framework enabling complex task decomposition, state machine execution, and verifiable output logging.",
      repoUrl: "https://github.com/demo/agentflow",
      demoUrl: "https://agentflow.demo.local",
      isDraft: false,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date("2026-09-10T12:00:00.000Z"),
    },
  });

  const submissionBeta = await prisma.submission.upsert({
    where: { teamId: teamBeta.id },
    update: {
      eventId: event.id,
      trackId: trackDev.id,
      projectName: "PulseTrace Telemetry",
      tagline: "Low-latency distributed tracing for microservices and cloud workers",
      description: "PulseTrace provides real-time distributed tracing with sub-millisecond overhead and interactive dependency graph visualization.",
      repoUrl: "https://github.com/demo/pulsetrace",
      demoUrl: "https://pulsetrace.demo.local",
      isDraft: false,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date("2026-09-11T14:30:00.000Z"),
    },
    create: {
      id: SEED_CONSTANTS.SUBMISSION_BETA_ID,
      eventId: event.id,
      teamId: teamBeta.id,
      trackId: trackDev.id,
      projectName: "PulseTrace Telemetry",
      tagline: "Low-latency distributed tracing for microservices and cloud workers",
      description: "PulseTrace provides real-time distributed tracing with sub-millisecond overhead and interactive dependency graph visualization.",
      repoUrl: "https://github.com/demo/pulsetrace",
      demoUrl: "https://pulsetrace.demo.local",
      isDraft: false,
      status: SubmissionStatus.SUBMITTED,
      submittedAt: new Date("2026-09-11T14:30:00.000Z"),
    },
  });

  // 8. Seed Judge Invitation
  console.log("Seeding judge invitation...");
  await prisma.judgeInvitation.upsert({
    where: {
      eventId_email: {
        eventId: event.id,
        email: "invited.judge@hackathon.local",
      },
    },
    update: {
      status: JudgeInviteStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
    create: {
      eventId: event.id,
      email: "invited.judge@hackathon.local",
      invitationToken: "seed_judge_invite_token_0000000000000000000000000000000000000001",
      invitedByUserId: organizerUser.id,
      status: JudgeInviteStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });

  // 9. Seed Rubric & Criteria (Sum to exactly 10,000 basis points)
  console.log("Seeding rubric and weighted criteria...");
  const rubric = await prisma.rubric.upsert({
    where: { eventId: event.id },
    update: {
      name: "Official Hackathon Judging Rubric",
      isLocked: true,
    },
    create: {
      id: SEED_CONSTANTS.RUBRIC_ID,
      eventId: event.id,
      name: "Official Hackathon Judging Rubric",
      isLocked: true,
    },
  });

  const criterionTech = await prisma.rubricCriterion.upsert({
    where: { id: SEED_CONSTANTS.CRITERION_TECH_ID },
    update: {
      name: "Technical Execution & Architecture",
      description: "Code architecture, quality, robustness, scalability, and system engineering.",
      weightBasisPoints: 4000, // 40.00%
      maxPoints: 10.0,
      orderIndex: 0,
    },
    create: {
      id: SEED_CONSTANTS.CRITERION_TECH_ID,
      rubricId: rubric.id,
      name: "Technical Execution & Architecture",
      description: "Code architecture, quality, robustness, scalability, and system engineering.",
      weightBasisPoints: 4000,
      maxPoints: 10.0,
      orderIndex: 0,
    },
  });

  const criterionInno = await prisma.rubricCriterion.upsert({
    where: { id: SEED_CONSTANTS.CRITERION_INNO_ID },
    update: {
      name: "Innovation & Originality",
      description: "Creativity of approach, novel features, and unique problem-solving insight.",
      weightBasisPoints: 3000, // 30.00%
      maxPoints: 10.0,
      orderIndex: 1,
    },
    create: {
      id: SEED_CONSTANTS.CRITERION_INNO_ID,
      rubricId: rubric.id,
      name: "Innovation & Originality",
      description: "Creativity of approach, novel features, and unique problem-solving insight.",
      weightBasisPoints: 3000,
      maxPoints: 10.0,
      orderIndex: 1,
    },
  });

  const criterionImpact = await prisma.rubricCriterion.upsert({
    where: { id: SEED_CONSTANTS.CRITERION_IMPACT_ID },
    update: {
      name: "Impact & Practical Utility",
      description: "Real-world utility, user experience, problem relevance, and adoption potential.",
      weightBasisPoints: 3000, // 30.00%
      maxPoints: 10.0,
      orderIndex: 2,
    },
    create: {
      id: SEED_CONSTANTS.CRITERION_IMPACT_ID,
      rubricId: rubric.id,
      name: "Impact & Practical Utility",
      description: "Real-world utility, user experience, problem relevance, and adoption potential.",
      weightBasisPoints: 3000,
      maxPoints: 10.0,
      orderIndex: 2,
    },
  });

  // 10. Seed Judge Assignments
  console.log("Seeding judge assignments...");
  // Judge 1 -> Submission Alpha (Evaluated)
  const assignJ1Alpha = await prisma.judgeAssignment.upsert({
    where: {
      judgeId_submissionId: {
        judgeId: judge1User.id,
        submissionId: submissionAlpha.id,
      },
    },
    update: { status: AssignmentStatus.COMPLETED },
    create: {
      id: SEED_CONSTANTS.ASSIGNMENT_J1_ALPHA_ID,
      eventId: event.id,
      judgeId: judge1User.id,
      submissionId: submissionAlpha.id,
      status: AssignmentStatus.COMPLETED,
    },
  });

  // Judge 2 -> Submission Alpha (Evaluated)
  const assignJ2Alpha = await prisma.judgeAssignment.upsert({
    where: {
      judgeId_submissionId: {
        judgeId: judge2User.id,
        submissionId: submissionAlpha.id,
      },
    },
    update: { status: AssignmentStatus.COMPLETED },
    create: {
      id: SEED_CONSTANTS.ASSIGNMENT_J2_ALPHA_ID,
      eventId: event.id,
      judgeId: judge2User.id,
      submissionId: submissionAlpha.id,
      status: AssignmentStatus.COMPLETED,
    },
  });

  // Judge 1 -> Submission Beta (Assigned, ready to evaluate)
  await prisma.judgeAssignment.upsert({
    where: {
      judgeId_submissionId: {
        judgeId: judge1User.id,
        submissionId: submissionBeta.id,
      },
    },
    update: { status: AssignmentStatus.ASSIGNED },
    create: {
      id: SEED_CONSTANTS.ASSIGNMENT_J1_BETA_ID,
      eventId: event.id,
      judgeId: judge1User.id,
      submissionId: submissionBeta.id,
      status: AssignmentStatus.ASSIGNED,
    },
  });

  // Judge 2 -> Submission Beta (Assigned, ready to evaluate)
  await prisma.judgeAssignment.upsert({
    where: {
      judgeId_submissionId: {
        judgeId: judge2User.id,
        submissionId: submissionBeta.id,
      },
    },
    update: { status: AssignmentStatus.ASSIGNED },
    create: {
      id: SEED_CONSTANTS.ASSIGNMENT_J2_BETA_ID,
      eventId: event.id,
      judgeId: judge2User.id,
      submissionId: submissionBeta.id,
      status: AssignmentStatus.ASSIGNED,
    },
  });

  // 11. Seed Completed Evaluations & Score Items
  console.log("Seeding completed evaluations...");
  // Judge 1 Evaluation:
  // C1: 9.0/10 (40%) = 36.0000
  // C2: 8.5/10 (30%) = 25.5000
  // C3: 9.0/10 (30%) = 27.0000
  // Raw Total: 88.5000
  const evalJ1 = await prisma.evaluation.upsert({
    where: { assignmentId: assignJ1Alpha.id },
    update: {
      rawTotalScore: 88.5,
      feedback: "Superb multi-agent coordination architecture with impressive test coverage.",
      isDraft: false,
    },
    create: {
      id: SEED_CONSTANTS.EVALUATION_J1_ALPHA_ID,
      assignmentId: assignJ1Alpha.id,
      submissionId: submissionAlpha.id,
      judgeId: judge1User.id,
      rawTotalScore: 88.5,
      feedback: "Superb multi-agent coordination architecture with impressive test coverage.",
      isDraft: false,
    },
  });

  await prisma.evaluationScoreItem.upsert({
    where: { evaluationId_criterionId: { evaluationId: evalJ1.id, criterionId: criterionTech.id } },
    update: { score: 9.0 },
    create: {
      evaluationId: evalJ1.id,
      criterionId: criterionTech.id,
      score: 9.0,
      comment: "Exceptional code quality and clean modular design.",
      criterionNameSnapshot: criterionTech.name,
      weightSnapshot: criterionTech.weightBasisPoints,
      maxPointsSnapshot: criterionTech.maxPoints,
    },
  });

  await prisma.evaluationScoreItem.upsert({
    where: { evaluationId_criterionId: { evaluationId: evalJ1.id, criterionId: criterionInno.id } },
    update: { score: 8.5 },
    create: {
      evaluationId: evalJ1.id,
      criterionId: criterionInno.id,
      score: 8.5,
      comment: "Creative routing mechanism for autonomous LLM sub-tasks.",
      criterionNameSnapshot: criterionInno.name,
      weightSnapshot: criterionInno.weightBasisPoints,
      maxPointsSnapshot: criterionInno.maxPoints,
    },
  });

  await prisma.evaluationScoreItem.upsert({
    where: { evaluationId_criterionId: { evaluationId: evalJ1.id, criterionId: criterionImpact.id } },
    update: { score: 9.0 },
    create: {
      evaluationId: evalJ1.id,
      criterionId: criterionImpact.id,
      score: 9.0,
      comment: "Significant immediate utility for engineering teams building autonomous workflows.",
      criterionNameSnapshot: criterionImpact.name,
      weightSnapshot: criterionImpact.weightBasisPoints,
      maxPointsSnapshot: criterionImpact.maxPoints,
    },
  });

  // Judge 2 Evaluation:
  // C1: 8.0/10 (40%) = 32.0000
  // C2: 9.0/10 (30%) = 27.0000
  // C3: 8.5/10 (30%) = 25.5000
  // Raw Total: 84.5000
  const evalJ2 = await prisma.evaluation.upsert({
    where: { assignmentId: assignJ2Alpha.id },
    update: {
      rawTotalScore: 84.5,
      feedback: "Great presentation and well-thought-out multi-agent flow. Very solid project.",
      isDraft: false,
    },
    create: {
      id: SEED_CONSTANTS.EVALUATION_J2_ALPHA_ID,
      assignmentId: assignJ2Alpha.id,
      submissionId: submissionAlpha.id,
      judgeId: judge2User.id,
      rawTotalScore: 84.5,
      feedback: "Great presentation and well-thought-out multi-agent flow. Very solid project.",
      isDraft: false,
    },
  });

  await prisma.evaluationScoreItem.upsert({
    where: { evaluationId_criterionId: { evaluationId: evalJ2.id, criterionId: criterionTech.id } },
    update: { score: 8.0 },
    create: {
      evaluationId: evalJ2.id,
      criterionId: criterionTech.id,
      score: 8.0,
      comment: "Solid architecture and clear project structure.",
      criterionNameSnapshot: criterionTech.name,
      weightSnapshot: criterionTech.weightBasisPoints,
      maxPointsSnapshot: criterionTech.maxPoints,
    },
  });

  await prisma.evaluationScoreItem.upsert({
    where: { evaluationId_criterionId: { evaluationId: evalJ2.id, criterionId: criterionInno.id } },
    update: { score: 9.0 },
    create: {
      evaluationId: evalJ2.id,
      criterionId: criterionInno.id,
      score: 9.0,
      comment: "Highly innovative approach to agentic fault tolerance.",
      criterionNameSnapshot: criterionInno.name,
      weightSnapshot: criterionInno.weightBasisPoints,
      maxPointsSnapshot: criterionInno.maxPoints,
    },
  });

  await prisma.evaluationScoreItem.upsert({
    where: { evaluationId_criterionId: { evaluationId: evalJ2.id, criterionId: criterionImpact.id } },
    update: { score: 8.5 },
    create: {
      evaluationId: evalJ2.id,
      criterionId: criterionImpact.id,
      score: 8.5,
      comment: "Demonstrated live with strong practical relevance.",
      criterionNameSnapshot: criterionImpact.name,
      weightSnapshot: criterionImpact.weightBasisPoints,
      maxPointsSnapshot: criterionImpact.maxPoints,
    },
  });

  // 12. Seed Demo Community Votes
  console.log("Seeding demo community votes...");
  const votes = [
    {
      eventId: event.id,
      submissionId: submissionAlpha.id,
      voterUserId: participant3.id,
      voterFingerprint: "fingerprint_carol_desktop_chrome",
      ipAddress: "127.0.0.1",
    },
    {
      eventId: event.id,
      submissionId: submissionAlpha.id,
      voterUserId: null,
      voterFingerprint: "fingerprint_public_voter_001",
      ipAddress: "192.168.1.10",
    },
    {
      eventId: event.id,
      submissionId: submissionBeta.id,
      voterUserId: participant1.id,
      voterFingerprint: "fingerprint_alice_laptop_safari",
      ipAddress: "127.0.0.1",
    },
    {
      eventId: event.id,
      submissionId: submissionBeta.id,
      voterUserId: participant2.id,
      voterFingerprint: "fingerprint_bob_workstation_firefox",
      ipAddress: "127.0.0.1",
    },
    {
      eventId: event.id,
      submissionId: submissionBeta.id,
      voterUserId: null,
      voterFingerprint: "fingerprint_public_voter_002",
      ipAddress: "192.168.1.20",
    },
  ];

  for (const v of votes) {
    await prisma.communityVote.upsert({
      where: {
        eventId_voterFingerprint_submissionId: {
          eventId: v.eventId,
          voterFingerprint: v.voterFingerprint,
          submissionId: v.submissionId,
        },
      },
      update: {},
      create: v,
    });
  }

  // 13. Seed Demo Community Comments
  console.log("Seeding demo community comments...");
  const comments = [
    {
      eventId: event.id,
      submissionId: submissionAlpha.id,
      authorUserId: participant3.id,
      content:
        "Impressive multi-agent coordination architecture! The fallback handling when individual worker nodes fail is exceptionally well executed.",
    },
    {
      eventId: event.id,
      submissionId: submissionAlpha.id,
      authorUserId: organizerUser.id,
      content:
        "The live demo was very compelling. Great job team on keeping the latency under 150ms.",
    },
    {
      eventId: event.id,
      submissionId: submissionBeta.id,
      authorUserId: participant1.id,
      content:
        "Love the eBPF kernel telemetry integration! Real-time distributed tracing with near-zero runtime overhead is fantastic.",
    },
  ];


  for (const c of comments) {
    const existing = await prisma.communityComment.findFirst({
      where: {
        submissionId: c.submissionId,
        authorUserId: c.authorUserId,
        content: c.content,
      },
    });
    if (!existing) {
      await prisma.communityComment.create({
        data: c,
      });
    }
  }

  console.log("Idempotent fixture seed completed successfully!");
}


main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
