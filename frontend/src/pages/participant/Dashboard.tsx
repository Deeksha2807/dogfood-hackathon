import React from "react";
import { Link } from "react-router-dom";
import { useHackathon } from "../../context/HackathonContext";
import { DeadlineCountdown } from "../../components/common/DeadlineCountdown";
import { StatCard } from "../../components/common/StatCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  Users,
  FolderGit2,
  Trophy,
  Compass,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Calendar,
  Radio,
  Clock,
} from "lucide-react";

export const ParticipantDashboard: React.FC = () => {
  const { eventConfig, tracks, teams, submissions, myTeam, mySubmission } = useHackathon();

  // Readiness Calculations
  const hasTeam = Boolean(myTeam);
  const hasTrack = Boolean(myTeam?.trackName || mySubmission?.trackName);
  const trackName = myTeam?.trackName || mySubmission?.trackName || "";
  const hasDraft = Boolean(mySubmission);
  const isFinalSubmitted = mySubmission?.status === "Submitted" || mySubmission?.status === "Judged" || mySubmission?.status === "Under Review";

  return (
    <div className="page-wrapper">
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(30, 27, 75, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)",
          borderColor: "rgba(99, 102, 241, 0.35)",
          padding: "2rem",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
          <div style={{ maxWidth: "720px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
              <span className="badge badge-primary" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Radio size={12} className="animate-pulse" /> Live Hackathon
              </span>
              <span className="badge badge-success">{eventConfig.phase} PHASE</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Calendar size={13} /> {eventConfig.dates}
              </span>
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem", color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              {eventConfig.name}
            </h1>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1rem" }}>
              {eventConfig.description}
            </p>
            {mySubmission && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "var(--bg-input)", padding: "0.4rem 0.8rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Your Project:</span>
                <strong style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>{mySubmission.projectName}</strong>
                <StatusBadge status={mySubmission.status} />
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link to="/project" className="btn btn-primary">
              <FolderGit2 size={16} /> My Submission
            </Link>
            <Link to="/team" className="btn btn-secondary">
              <Users size={16} /> My Team
            </Link>
            <Link to="/rules" className="btn btn-secondary">
              <Sparkles size={16} /> Rules & Rubric
            </Link>
          </div>
        </div>
      </div>

      {/* Deadline countdown & readiness grid */}
      <div className="grid-sidebar" style={{ marginBottom: "2rem" }}>
        {/* Deadline Countdown */}
        <DeadlineCountdown
          deadline={eventConfig.submissionDeadline}
          title="Project Submission Deadline"
        />

        {/* Readiness Checklist */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckCircle2 size={18} color="var(--accent-emerald)" /> Readiness Tracker
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>4-Step Progression</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {/* Step 1 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-input)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>1. Join / Create Team</span>
                {myTeam && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>({myTeam.name})</span>}
              </div>
              {hasTeam ? (
                <span className="badge badge-success">Done</span>
              ) : (
                <Link to="/team" className="badge badge-warning" style={{ textDecoration: "none" }}>
                  Join Team →
                </Link>
              )}
            </div>

            {/* Step 2 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-input)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>2. Select Track</span>
                {hasTrack && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>({trackName})</span>}
              </div>
              {hasTrack ? (
                <span className="badge badge-success">Selected</span>
              ) : (
                <Link to="/tracks" className="badge badge-neutral" style={{ textDecoration: "none" }}>
                  Select Track →
                </Link>
              )}
            </div>

            {/* Step 3 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-input)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>3. Project Draft</span>
              </div>
              {hasDraft ? (
                <span className="badge badge-success">Draft Saved</span>
              ) : (
                <Link to="/project/create" className="badge badge-warning" style={{ textDecoration: "none" }}>
                  Start Draft →
                </Link>
              )}
            </div>

            {/* Step 4 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem", borderRadius: "var(--radius-sm)", background: "var(--bg-input)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>4. Final Submission</span>
              </div>
              {isFinalSubmitted ? (
                <span className="badge badge-success">Submitted</span>
              ) : (
                <Link to="/project" className="badge badge-warning" style={{ textDecoration: "none" }}>
                  Pending Submit →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid-4" style={{ marginBottom: "2.5rem" }}>
        <StatCard
          title="Challenge Tracks"
          value={tracks.length}
          subtitle="Specialized prize categories"
          icon={<Compass size={20} />}
        />
        <StatCard
          title="Total Prize Pool"
          value="$18,000"
          subtitle="Cash & awards"
          icon={<Trophy size={20} />}
        />
        <StatCard
          title="Registered Teams"
          value={teams.length}
          subtitle="Active competitor teams"
          icon={<Users size={20} />}
        />
        <StatCard
          title="Submissions Ready"
          value={submissions.length}
          subtitle="Projects in review pool"
          icon={<FolderGit2 size={20} />}
        />
      </div>

      {/* Discover Tracks Section */}
      <div style={{ marginBottom: "2.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700 }}>Competition Challenge Tracks</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
              Target an area of focus to optimize your solution for expert evaluation
            </p>
          </div>
          <Link to="/tracks" className="btn btn-secondary btn-sm">
            View All 5 Tracks <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid-3">
          {tracks.map((track) => (
            <div key={track.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: "0.75rem" }}>
                  Track
                </span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {track.name}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                  {track.description}
                </p>
              </div>
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {track.criteria || "Standard 5-Factor Rubric"}
                </span>
                <Link to="/project" className="btn btn-secondary btn-sm">
                  Build for Track
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
