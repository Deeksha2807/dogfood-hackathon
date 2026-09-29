import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useHackathon } from "../../context/HackathonContext";
import { useAuth } from "../../context/AuthContext";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  ClipboardList,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  GitBranch,
  Globe,
  Video,
  CheckCircle2,
  Clock,
  Sparkles,
  Scale,
  Award,
  AlertCircle,
} from "lucide-react";

export const JudgeProjects: React.FC = () => {
  const { user } = useAuth();
  const { submissions, evaluations, judges, tracks } = useHackathon();

  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "SCORED">("ALL");
  const [trackFilter, setTrackFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Determine active judge ID
  const isJudge2 = user?.email?.includes("judge2") || user?.id?.includes("judge-2");
  const isJudge3 = user?.email?.includes("judge3") || user?.id?.includes("judge-3");
  const activeJudgeId = isJudge3 ? "judge-3" : isJudge2 ? "judge-2" : "judge-1";
  const activeJudge = judges.find((j) => j.id === activeJudgeId) || judges[0];

  // Assigned submissions for this judge (10 for Dr. Brody, 10 for Dr. Chen, 9 for Alex Rivera)
  // Dr. Brody gets projects 1 to 10
  // Dr. Chen gets projects 6 to 15
  // Alex Rivera gets projects 11 to 19
  const assignedSubmissions = submissions.filter((s, idx) => {
    if (activeJudgeId === "judge-1") return idx < 10;
    if (activeJudgeId === "judge-2") return idx >= 5 && idx < 15;
    return idx >= 10 && idx < 19;
  });

  const getEvaluationStatus = (subId: string) => {
    const ev = evaluations.find((e) => e.judgeId === activeJudgeId && e.submissionId === subId);
    if (!ev) return { status: "Pending", score: null, isRecused: false };
    if (ev.isRecused) return { status: "Recused", score: null, isRecused: true };
    if (ev.isDraft) return { status: "Draft", score: ev.totalScore, isRecused: false };
    return { status: "Scored", score: ev.totalScore, isRecused: false };
  };

  const scoredCount = assignedSubmissions.filter((s) => {
    const st = getEvaluationStatus(s.id);
    return st.status === "Scored" || st.isRecused;
  }).length;

  const totalAssigned = assignedSubmissions.length;
  const progressPercentage = Math.round((scoredCount / (totalAssigned || 1)) * 100);

  const filtered = assignedSubmissions.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.projectName.toLowerCase().includes(q) ||
      s.tagline.toLowerCase().includes(q) ||
      s.teamName.toLowerCase().includes(q);

    const matchesTrack = trackFilter === "ALL" || s.trackName === trackFilter || s.trackId === trackFilter;

    const evalInfo = getEvaluationStatus(s.id);
    let matchesStatus = true;
    if (statusFilter === "PENDING") {
      matchesStatus = evalInfo.status === "Pending" || evalInfo.status === "Draft";
    } else if (statusFilter === "SCORED") {
      matchesStatus = evalInfo.status === "Scored" || evalInfo.isRecused;
    }

    return matchesSearch && matchesTrack && matchesStatus;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <ClipboardList size={28} color="var(--primary)" /> Assigned Project Evaluations
          </h1>
          <p>
            Evaluate assigned projects according to the official 5-criteria rubric
          </p>
        </div>
      </div>

      {/* Judging Progress Card ("6 of 10") */}
      <div
        className="card"
        style={{
          marginBottom: "1.75rem",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(30, 41, 59, 0.8) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          padding: "1.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
              Evaluator Workload ({activeJudge.name})
            </span>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, marginTop: "0.2rem" }}>
              Completed {scoredCount} of {totalAssigned} Assigned Projects
            </h3>
          </div>
          <span className="badge badge-primary" style={{ fontSize: "0.85rem", padding: "0.3rem 0.75rem" }}>
            {progressPercentage}% Scored
          </span>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            height: "10px",
            background: "var(--bg-input)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progressPercentage}%`,
              background: "linear-gradient(90deg, var(--primary) 0%, var(--accent-emerald) 100%)",
              borderRadius: "var(--radius-full)",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>

      {/* Filters */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 1.25rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 260px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search your assigned projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.25rem" }}
          />
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            style={{ minWidth: "160px" }}
          >
            <option value="ALL">All Evaluation States</option>
            <option value="PENDING">Pending Score</option>
            <option value="SCORED">Scored / Complete</option>
          </select>

          <select
            className="form-select"
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            style={{ minWidth: "170px" }}
          >
            <option value="ALL">All Tracks</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            No assigned projects matching your filters.
          </div>
        ) : (
          filtered.map((sub) => {
            const evInfo = getEvaluationStatus(sub.id);
            const isDone = evInfo.status === "Scored";
            const isRecused = evInfo.isRecused;

            return (
              <div
                key={sub.id}
                className="card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1.25rem",
                  borderColor: isDone ? "rgba(16, 185, 129, 0.4)" : isRecused ? "rgba(244, 63, 94, 0.4)" : "var(--border-color)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", maxWidth: "600px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, margin: 0 }}>
                      {sub.projectName}
                    </h3>
                    <span className="badge badge-primary">{sub.trackName}</span>
                    {isDone ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> Scored: {evInfo.score}/100
                      </span>
                    ) : isRecused ? (
                      <span className="badge badge-danger">Recused</span>
                    ) : (
                      <span className="badge badge-warning">
                        <Clock size={12} /> Pending Score
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", margin: 0 }}>
                    {sub.tagline}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    <span>By: <strong>{sub.teamName}</strong></span>
                    <span>•</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {sub.demoUrl && (
                        <a href={sub.demoUrl} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                          <Globe size={13} /> Demo
                        </a>
                      )}
                      {sub.repoUrl && (
                        <a href={sub.repoUrl} target="_blank" rel="noreferrer" style={{ color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                          <GitBranch size={13} /> GitHub
                        </a>
                      )}
                      {sub.videoUrl && (
                        <a href={sub.videoUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent-amber)", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                          <Video size={13} /> Video
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {isRecused ? (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      Conflict of Interest Declared
                    </span>
                  ) : (
                    <Link
                      to={`/judge/projects/${sub.id}`}
                      className={`btn ${isDone ? "btn-secondary" : "btn-primary"}`}
                    >
                      {isDone ? "Edit Evaluation" : "Start Evaluation"} <ArrowRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
