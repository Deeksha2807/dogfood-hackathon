export type GlobalRole = "SUPER_ADMIN" | "ADMIN" | "USER";
export type EventRoleType = "ORGANIZER" | "JUDGE" | "PARTICIPANT";
export type EventStatus = "DRAFT" | "ACTIVE" | "JUDGING" | "COMPLETED" | "ARCHIVED";
export type TeamRole = "LEADER" | "MEMBER";
export type SubmissionStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
export type JudgeInviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
export type AssignmentStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface User {
  id: string;
  email: string;
  name: string;
  globalRole: GlobalRole;
  isActive: boolean;
  createdAt?: string;
  eventRoles?: {
    eventId: string;
    role: EventRoleType;
  }[];
}

export interface Track {
  id: string;
  eventId: string;
  name: string;
  description: string;
  criteria?: string;
  createdAt?: string;
}

export interface Prize {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  amount: number;
  rank?: number;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  status: EventStatus;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  judgingDeadline: string;
  maxTeamSize: number;
  resultsPublished: boolean;
  tracks?: Track[];
  prizes?: Prize[];
  _count?: {
    teams?: number;
    submissions?: number;
  };
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Team {
  id: string;
  eventId: string;
  name: string;
  inviteCode: string;
  maxMembers: number;
  createdAt: string;
  members: TeamMember[];
  submission?: Submission | null;
}

export interface Submission {
  id: string;
  eventId: string;
  teamId: string;
  trackId: string;
  projectName: string;
  tagline: string;
  description: string;
  repoUrl?: string | null;
  demoUrl?: string | null;
  videoUrl?: string | null;
  isDraft: boolean;
  status: SubmissionStatus;
  submittedAt?: string | null;
  createdAt?: string;
  track?: Track;
  team?: Team;
  voteCount?: number;
}

export interface JudgeInvitation {
  id: string;
  eventId: string;
  email: string;
  role: EventRoleType;
  status: JudgeInviteStatus;
  expiresAt: string;
  acceptedAt?: string | null;
  invitedById: string;
  createdAt: string;
}

export interface RubricCriterion {
  id: string;
  rubricId: string;
  name: string;
  description?: string;
  weight: number;
  maxScore: number;
}

export interface Rubric {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  minScore: number;
  maxScore: number;
  criteria: RubricCriterion[];
}

export interface EvaluationScore {
  id?: string;
  criterionId: string;
  score: number;
  criterion?: RubricCriterion;
}

export interface Evaluation {
  id: string;
  assignmentId: string;
  judgeId: string;
  submissionId: string;
  totalRawScore: number;
  normalizedScore?: number;
  feedback?: string;
  isDraft: boolean;
  submittedAt?: string;
  scores: EvaluationScore[];
  judge?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface JudgeAssignment {
  id: string;
  eventId: string;
  judgeId: string;
  submissionId: string;
  status: AssignmentStatus;
  assignedById: string;
  assignedAt: string;
  submission?: Submission;
  judge?: User;
  evaluation?: Evaluation | null;
}

export interface JudgeProgress {
  judgeId: string;
  judgeName?: string;
  assignedCount: number;
  completedCount: number;
  pendingCount: number;
  completionPercentage: number;
}

export interface OverallJudgingProgress {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  overallPercentage: number;
  judgesProgress: JudgeProgress[];
}

export interface FinalResult {
  submissionId: string;
  projectName: string;
  tagline?: string;
  teamName: string;
  trackName: string;
  judgeCount: number;
  rawScoreAvg: number;
  normalizedScore: number;
  finalScore: number;
  rank: number;
  status: string;
  criteriaScores?: {
    innovation: number;
    technical: number;
    impact: number;
    ux: number;
    presentation: number;
  };
}

export interface ProjectComment {
  id: string;
  submissionId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
