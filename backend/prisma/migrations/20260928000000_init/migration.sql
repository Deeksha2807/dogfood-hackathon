-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "GlobalRole" AS ENUM ('SUPER_ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "EventRoleType" AS ENUM ('ORGANIZER', 'JUDGE', 'PARTICIPANT');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'EVALUATED');

-- CreateEnum
CREATE TYPE "JudgeInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('APPROVED', 'PENDING', 'FLAGGED', 'REMOVED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('PARTICIPATION', 'WINNER', 'TRACK_WINNER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "globalRole" "GlobalRole" NOT NULL DEFAULT 'USER',
    "tokenVersion" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionTokenHash" VARCHAR(64) NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenVersion" INTEGER NOT NULL DEFAULT 1,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRole" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "EventRoleType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "submissionDeadline" TIMESTAMP(3) NOT NULL,
    "judgingDeadline" TIMESTAMP(3) NOT NULL,
    "resultsPublished" BOOLEAN NOT NULL DEFAULT false,
    "maxTeamSize" INTEGER NOT NULL DEFAULT 4,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prize" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "trackId" TEXT,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "cashValue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrizeAward" (
    "id" TEXT NOT NULL,
    "prizeId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rankPosition" INTEGER NOT NULL DEFAULT 1,
    "notes" VARCHAR(255),
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrizeAward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "trackId" TEXT,
    "name" VARCHAR(150) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamInvite" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "inviteCode" VARCHAR(12) NOT NULL,
    "inviteToken" VARCHAR(64) NOT NULL,
    "targetEmail" VARCHAR(255),
    "maxUses" INTEGER NOT NULL DEFAULT 5,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "status" "InviteStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "projectName" VARCHAR(255) NOT NULL,
    "tagline" VARCHAR(300),
    "description" TEXT NOT NULL,
    "repoUrl" VARCHAR(500),
    "demoUrl" VARCHAR(500),
    "videoUrl" VARCHAR(500),
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "submittedAt" TIMESTAMP(3),
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgeInvitation" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "invitationToken" VARCHAR(64) NOT NULL,
    "invitedByUserId" TEXT NOT NULL,
    "status" "JudgeInviteStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JudgeInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rubric" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rubric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricCriterion" (
    "id" TEXT NOT NULL,
    "rubricId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "weightBasisPoints" INTEGER NOT NULL,
    "maxPoints" DECIMAL(5,2) NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "RubricCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JudgeAssignment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "batchId" VARCHAR(64),
    "status" "AssignmentStatus" NOT NULL DEFAULT 'ASSIGNED',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JudgeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "judgeId" TEXT NOT NULL,
    "rawTotalScore" DECIMAL(7,4) NOT NULL,
    "feedback" TEXT,
    "isDraft" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationScoreItem" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "comment" VARCHAR(500),
    "criterionNameSnapshot" VARCHAR(100) NOT NULL,
    "weightSnapshot" INTEGER NOT NULL,
    "maxPointsSnapshot" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "EvaluationScoreItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalResult" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "rawAverageScore" DECIMAL(7,4) NOT NULL,
    "normalizedScore" DECIMAL(7,4) NOT NULL,
    "communityVoteCount" INTEGER NOT NULL DEFAULT 0,
    "finalCompositeScore" DECIMAL(7,4) NOT NULL,
    "rank" INTEGER NOT NULL,
    "trackRank" INTEGER,
    "tieBreakerReason" VARCHAR(255),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "FinalResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityVote" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "voterUserId" TEXT,
    "voterFingerprint" VARCHAR(128) NOT NULL,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityComment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "authorUserId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "moderationStatus" "CommentStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" VARCHAR(128) NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" VARCHAR(45),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookSubscription" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "targetUrl" VARCHAR(500) NOT NULL,
    "secretToken" VARCHAR(64) NOT NULL,
    "subscribedEvents" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookDelivery" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "event" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "httpStatus" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "WebhookDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "recipientName" VARCHAR(150) NOT NULL,
    "certificateType" "CertificateType" NOT NULL,
    "certificateCode" VARCHAR(64) NOT NULL,
    "metadataJson" JSONB,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignedJudgeRecord" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "judgeUserId" TEXT NOT NULL,
    "evaluationsCount" INTEGER NOT NULL,
    "canonicalPayloadText" TEXT NOT NULL,
    "digitalSignature" VARCHAR(512) NOT NULL,
    "keyIdentifier" VARCHAR(64) NOT NULL,
    "verificationHash" VARCHAR(64) NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignedJudgeRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionTokenHash_key" ON "Session"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "Session_sessionTokenHash_idx" ON "Session"("sessionTokenHash");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_userId_isValid_idx" ON "Session"("userId", "isValid");

-- CreateIndex
CREATE INDEX "EventRole_userId_eventId_idx" ON "EventRole"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRole_eventId_userId_role_key" ON "EventRole"("eventId", "userId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Track_eventId_name_key" ON "Track"("eventId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Track_id_eventId_key" ON "Track"("id", "eventId");

-- CreateIndex
CREATE INDEX "Prize_eventId_idx" ON "Prize"("eventId");

-- CreateIndex
CREATE INDEX "PrizeAward_eventId_prizeId_idx" ON "PrizeAward"("eventId", "prizeId");

-- CreateIndex
CREATE UNIQUE INDEX "PrizeAward_prizeId_submissionId_key" ON "PrizeAward"("prizeId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Team_eventId_name_key" ON "Team"("eventId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_id_eventId_key" ON "Team"("id", "eventId");

-- CreateIndex
CREATE INDEX "TeamMember_eventId_userId_idx" ON "TeamMember"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_userId_eventId_key" ON "TeamMember"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvite_inviteCode_key" ON "TeamInvite"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvite_inviteToken_key" ON "TeamInvite"("inviteToken");

-- CreateIndex
CREATE INDEX "TeamInvite_inviteCode_idx" ON "TeamInvite"("inviteCode");

-- CreateIndex
CREATE INDEX "TeamInvite_inviteToken_idx" ON "TeamInvite"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_teamId_key" ON "Submission"("teamId");

-- CreateIndex
CREATE INDEX "Submission_eventId_status_idx" ON "Submission"("eventId", "status");

-- CreateIndex
CREATE INDEX "Submission_trackId_idx" ON "Submission"("trackId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_id_eventId_key" ON "Submission"("id", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "Submission_teamId_eventId_key" ON "Submission"("teamId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "JudgeInvitation_invitationToken_key" ON "JudgeInvitation"("invitationToken");

-- CreateIndex
CREATE INDEX "JudgeInvitation_invitationToken_idx" ON "JudgeInvitation"("invitationToken");

-- CreateIndex
CREATE UNIQUE INDEX "JudgeInvitation_eventId_email_key" ON "JudgeInvitation"("eventId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "Rubric_eventId_key" ON "Rubric"("eventId");

-- CreateIndex
CREATE INDEX "RubricCriterion_rubricId_orderIndex_idx" ON "RubricCriterion"("rubricId", "orderIndex");

-- CreateIndex
CREATE INDEX "JudgeAssignment_eventId_judgeId_idx" ON "JudgeAssignment"("eventId", "judgeId");

-- CreateIndex
CREATE INDEX "JudgeAssignment_batchId_idx" ON "JudgeAssignment"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "JudgeAssignment_judgeId_submissionId_key" ON "JudgeAssignment"("judgeId", "submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_assignmentId_key" ON "Evaluation"("assignmentId");

-- CreateIndex
CREATE INDEX "Evaluation_judgeId_idx" ON "Evaluation"("judgeId");

-- CreateIndex
CREATE INDEX "Evaluation_submissionId_idx" ON "Evaluation"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_submissionId_judgeId_key" ON "Evaluation"("submissionId", "judgeId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationScoreItem_evaluationId_criterionId_key" ON "EvaluationScoreItem"("evaluationId", "criterionId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalResult_submissionId_key" ON "FinalResult"("submissionId");

-- CreateIndex
CREATE INDEX "FinalResult_eventId_rank_idx" ON "FinalResult"("eventId", "rank");

-- CreateIndex
CREATE INDEX "CommunityVote_submissionId_idx" ON "CommunityVote"("submissionId");

-- CreateIndex
CREATE INDEX "CommunityVote_voterUserId_idx" ON "CommunityVote"("voterUserId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityVote_eventId_voterFingerprint_submissionId_key" ON "CommunityVote"("eventId", "voterFingerprint", "submissionId");

-- CreateIndex
CREATE INDEX "CommunityComment_submissionId_moderationStatus_idx" ON "CommunityComment"("submissionId", "moderationStatus");

-- CreateIndex
CREATE INDEX "CommunityComment_authorUserId_idx" ON "CommunityComment"("authorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "WebhookDelivery_subscriptionId_status_idx" ON "WebhookDelivery"("subscriptionId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateCode_key" ON "Certificate"("certificateCode");

-- CreateIndex
CREATE INDEX "Certificate_certificateCode_idx" ON "Certificate"("certificateCode");

-- CreateIndex
CREATE INDEX "Certificate_recipientUserId_eventId_idx" ON "Certificate"("recipientUserId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "SignedJudgeRecord_verificationHash_key" ON "SignedJudgeRecord"("verificationHash");

-- CreateIndex
CREATE INDEX "SignedJudgeRecord_verificationHash_idx" ON "SignedJudgeRecord"("verificationHash");

-- CreateIndex
CREATE INDEX "SignedJudgeRecord_judgeUserId_eventId_idx" ON "SignedJudgeRecord"("judgeUserId", "eventId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRole" ADD CONSTRAINT "EventRole_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRole" ADD CONSTRAINT "EventRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizeAward" ADD CONSTRAINT "PrizeAward_prizeId_fkey" FOREIGN KEY ("prizeId") REFERENCES "Prize"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizeAward" ADD CONSTRAINT "PrizeAward_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrizeAward" ADD CONSTRAINT "PrizeAward_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_eventId_fkey" FOREIGN KEY ("teamId", "eventId") REFERENCES "Team"("id", "eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvite" ADD CONSTRAINT "TeamInvite_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_teamId_eventId_fkey" FOREIGN KEY ("teamId", "eventId") REFERENCES "Team"("id", "eventId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_trackId_eventId_fkey" FOREIGN KEY ("trackId", "eventId") REFERENCES "Track"("id", "eventId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeInvitation" ADD CONSTRAINT "JudgeInvitation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rubric" ADD CONSTRAINT "Rubric_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCriterion" ADD CONSTRAINT "RubricCriterion_rubricId_fkey" FOREIGN KEY ("rubricId") REFERENCES "Rubric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeAssignment" ADD CONSTRAINT "JudgeAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeAssignment" ADD CONSTRAINT "JudgeAssignment_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JudgeAssignment" ADD CONSTRAINT "JudgeAssignment_submissionId_eventId_fkey" FOREIGN KEY ("submissionId", "eventId") REFERENCES "Submission"("id", "eventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "JudgeAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_judgeId_fkey" FOREIGN KEY ("judgeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationScoreItem" ADD CONSTRAINT "EvaluationScoreItem_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationScoreItem" ADD CONSTRAINT "EvaluationScoreItem_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "RubricCriterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalResult" ADD CONSTRAINT "FinalResult_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalResult" ADD CONSTRAINT "FinalResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityVote" ADD CONSTRAINT "CommunityVote_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityVote" ADD CONSTRAINT "CommunityVote_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityVote" ADD CONSTRAINT "CommunityVote_voterUserId_fkey" FOREIGN KEY ("voterUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityComment" ADD CONSTRAINT "CommunityComment_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "WebhookSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignedJudgeRecord" ADD CONSTRAINT "SignedJudgeRecord_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignedJudgeRecord" ADD CONSTRAINT "SignedJudgeRecord_judgeUserId_fkey" FOREIGN KEY ("judgeUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

