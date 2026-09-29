import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useHackathon } from "../../context/HackathonContext";
import { useToast } from "../../context/ToastContext";
import { StatCard } from "../../components/common/StatCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Scale,
  Calendar,
  Sliders,
  BarChart3,
  ArrowRight,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Eye,
  Plus,
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const {
    participants,
    teams,
    submissions,
    evaluations,
    eventConfig,
    extendDeadline,
    tracks,
    notifications,
  } = useHackathon();
  const { success } = useToast();

  const [extendHours, setExtendHours] = useState(24);

  // Submissions judged calculation
  const completedEvaluations = evaluations.filter((e) => !e.isDraft && !e.isRecused);
  const evaluatedSubIds = new Set(completedEvaluations.map((e) => e.submissionId));
  const judgedPercentage = Math.round((evaluatedSubIds.size / (submissions.length || 1)) * 100);

  // Submissions by track
  const trackStats = tracks.map((t) => {
    const count = submissions.filter(
      (s) => s.trackId === t.id || s.trackName.toLowerCase() === t.name.toLowerCase()
    ).length;
    const percentage = Math.round((count / (submissions.length || 1)) * 100);
    return { track: t, count, percentage };
  });

  const handleExtendDeadline = (hrs: number) => {
    extendDeadline(hrs);
    success(`Submission deadline extended by ${hrs} hours!`);
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <LayoutDashboard size={28} color="var(--primary)" /> Organizer Command Center
          </h1>
          <p>
            Real-time telemetry and management oversight for {eventConfig.name}
          </p>
        </div>

        <div className="page-actions">
          <Link to="/admin/results" className="btn btn-secondary">
            <BarChart3 size={16} /> Results & Normalization
          </Link>
          <Link to="/admin/settings" className="btn btn-primary">
            <Sliders size={16} /> Event Settings
          </Link>
        </div>
      </div>

      {/* KPI Cards: Participants 120, Teams 35, Submissions 28, Judged % */}
      <div className="grid-4" style={{ marginBottom: "2rem" }}>
        <StatCard
          title="Total Participants"
          value={participants.length}
          subtitle="Registered hackers"
          icon={<Users size={20} />}
        />
        <StatCard
          title="Active Teams"
          value={teams.length}
          subtitle="Formed squads"
          icon={<Layers size={20} />}
        />
        <StatCard
          title="Total Submissions"
          value={submissions.length}
          subtitle="Projects in queue"
          icon={<FolderGit2 size={20} />}
        />
        <StatCard
          title="Judged Projects"
          value={`${judgedPercentage}%`}
          subtitle={`${evaluatedSubIds.size} of ${submissions.length} scored`}
          icon={<Scale size={20} />}
        />
      </div>

      {/* Submission Statistics & Deadline Status */}
      <div className="grid-sidebar" style={{ marginBottom: "2rem" }}>
        {/* Submission Statistics Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <TrendingUp size={18} color="var(--primary)" /> Submission Statistics by Track
            </h3>
            <span className="badge badge-primary">{submissions.length} Total Deliverables</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {trackStats.map(({ track, count, percentage }) => (
              <div key={track.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", fontSize: "0.85rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{track.name}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontWeight: 600 }}>
                    {count} projects ({percentage}%)
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-full)",
                    overflow: "hidden",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${percentage}%`,
                      background: "linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)",
                      borderRadius: "var(--radius-full)",
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadline Status & Extend Action */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header">
              <h3 className="card-title">
                <Clock size={18} color="var(--accent-amber)" /> Deadline Status
              </h3>
              <span className="badge badge-warning">Phase: {eventConfig.phase}</span>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Submission Deadline:
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.2rem" }}>
                {new Date(eventConfig.submissionDeadline).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Judging Closes:
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.2rem" }}>
                {new Date(eventConfig.judgingDeadline).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "1rem" }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.5rem", fontWeight: 600 }}>
              Need to give hackers more time?
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleExtendDeadline(12)}
                style={{ flex: 1 }}
              >
                +12 Hours
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleExtendDeadline(24)}
                style={{ flex: 1 }}
              >
                +24 Hours
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table Preview */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h3 className="card-title">
            <FolderGit2 size={18} color="var(--primary)" /> Recent Submissions
          </h3>
          <Link to="/admin/submissions" className="btn btn-secondary btn-sm">
            View All ({submissions.length}) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Team</th>
                <th>Track</th>
                <th>Status</th>
                <th>Deliverables</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.slice(0, 5).map((sub) => (
                <tr key={sub.id}>
                  <td style={{ maxWidth: "260px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{sub.projectName}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {sub.tagline}
                    </div>
                  </td>
                  <td>{sub.teamName}</td>
                  <td>
                    <span className="badge badge-primary">{sub.trackName}</span>
                  </td>
                  <td>
                    <StatusBadge status={sub.status} />
                  </td>
                  <td>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {sub.demoUrl ? "Live Demo • " : ""}{sub.repoUrl ? "GitHub" : ""}
                    </span>
                  </td>
                  <td>
                    <Link to="/admin/submissions" className="btn btn-secondary btn-sm" style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}>
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Sparkles size={18} color="var(--accent-cyan)" /> Live System Activity & Audit Events
          </h3>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {notifications.slice(0, 4).map((n) => (
            <div
              key={n.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-md)",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: n.type === "deadline" ? "var(--accent-amber)" : "var(--primary)",
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)" }}>{n.title}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{n.message}</div>
                </div>
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                {n.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
