import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { judgingService } from "../../services/judgingService";
import { MOCK_JUDGE_ASSIGNMENTS } from "../../services/mockData";
import { JudgeAssignment, JudgeProgress } from "../../types";
import { StatCard } from "../../components/common/StatCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import {
  Award,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  Scale,
  Sparkles,
} from "lucide-react";

export const JudgeDashboard: React.FC = () => {
  const { user, activeEventId } = useAuth();
  const [assignments, setAssignments] = useState<JudgeAssignment[]>(MOCK_JUDGE_ASSIGNMENTS);
  const [progress, setProgress] = useState<JudgeProgress>({
    judgeId: user?.id || "u-judge-1",
    assignedCount: 2,
    completedCount: 1,
    pendingCount: 1,
    completionPercentage: 50,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadJudgeData = async () => {
      try {
        const [assRes, progRes] = await Promise.all([
          judgingService.getMyAssignments(activeEventId).catch(() => ({ assignments: MOCK_JUDGE_ASSIGNMENTS })),
          judgingService.getJudgeProgress(activeEventId).catch(() => ({ progress })),
        ]);
        if (assRes.assignments && assRes.assignments.length > 0) {
          setAssignments(assRes.assignments);
        }
        if (progRes.progress) {
          setProgress(progRes.progress);
        }
      } catch {}
    };
    loadJudgeData();
  }, [activeEventId]);

  if (isLoading) {
    return <LoadingSpinner fullPage message="Loading judge workspace..." />;
  }

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span className="badge badge-primary">Judge Portal</span>
          </div>
          <h1>
            <Award size={28} color="var(--primary)" /> Evaluation Dashboard
          </h1>
          <p>Welcome, {user?.name || "Judge"}. Review your assigned submissions and score against competition rubrics.</p>
        </div>

        <div className="page-actions">
          <Link to="/judge/projects" className="btn btn-primary">
            <ClipboardList size={16} /> View All Assigned Projects
          </Link>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <StatCard
          title="Assigned Projects"
          value={progress.assignedCount || assignments.length}
          subtitle="Total queue"
          icon={<ClipboardList size={20} />}
        />
        <StatCard
          title="Evaluations Completed"
          value={progress.completedCount || 1}
          subtitle="Finalized & scored"
          icon={<CheckCircle2 size={20} />}
        />
        <StatCard
          title="Pending Reviews"
          value={progress.pendingCount || 1}
          subtitle="Awaiting your score"
          icon={<Clock size={20} />}
        />
      </div>

      {/* Progress Meter Card */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h3 className="card-title">
            <Scale size={18} color="var(--primary)" /> Your Judging Completion Rate
          </h3>
          <span className="badge badge-primary">{progress.completionPercentage}% Completed</span>
        </div>

        <div
          style={{
            height: "12px",
            background: "var(--bg-input)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
            marginBottom: "0.75rem",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress.completionPercentage}%`,
              background: "linear-gradient(90deg, var(--primary) 0%, var(--accent-emerald) 100%)",
              borderRadius: "var(--radius-full)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <span>{progress.completedCount} completed</span>
          <span>{progress.pendingCount} remaining</span>
        </div>
      </div>

      {/* Assigned Projects List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <ClipboardList size={18} color="var(--primary)" /> Assigned Projects Queue
          </h3>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Track</th>
                <th>Team</th>
                <th>Evaluation Status</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                      {a.submission?.projectName || "Hackathon Project"}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {a.submission?.tagline?.substring(0, 50)}...
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary">
                      {a.submission?.track?.name || "AI Track"}
                    </span>
                  </td>
                  <td>{a.submission?.team?.name || "Hacker Team"}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>
                    {a.evaluation ? (
                      <span style={{ fontWeight: 700, color: "var(--accent-emerald)" }}>
                        {a.evaluation.totalRawScore} / 10
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Pending</span>
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/judge/evaluate/${a.id}`}
                      className={`btn ${a.status === "COMPLETED" ? "btn-secondary" : "btn-primary"} btn-sm`}
                    >
                      {a.status === "COMPLETED" ? "Review Score" : "Score Project"} <ArrowRight size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
