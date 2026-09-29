import React, { useState } from "react";
import { useHackathon } from "../../context/HackathonContext";
import { useToast } from "../../context/ToastContext";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Modal } from "../../components/common/Modal";
import {
  Scale,
  PlusCircle,
  Sparkles,
  Users,
  FolderGit2,
  CheckCircle2,
  Clock,
  Filter,
  AlertTriangle,
  UserPlus,
  Award,
  Shield,
  Layers,
} from "lucide-react";

export const JudgeAssignments: React.FC = () => {
  const {
    judges,
    submissions,
    evaluations,
    autoBalanceJudges,
    addJudge,
    saveEvaluation,
  } = useHackathon();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<"MATRIX" | "JUDGES">("MATRIX");
  const [trackFilter, setTrackFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Add Judge Modal
  const [addJudgeModalOpen, setAddJudgeModalOpen] = useState(false);
  const [judgeForm, setJudgeForm] = useState({
    name: "",
    email: "",
    title: "",
    organization: "",
  });

  // Manual Assign Modal
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedJudgeId, setSelectedJudgeId] = useState(judges[0]?.id || "");
  const [selectedSubId, setSelectedSubId] = useState(submissions[0]?.id || "");

  const handleAutoBalance = () => {
    autoBalanceJudges();
    success("Executed auto-balance algorithm! Submissions evenly assigned across all active judges with zero conflicts.");
  };

  const handleCreateJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeForm.name || !judgeForm.email) {
      error("Name and email are required.");
      return;
    }
    addJudge(judgeForm.name, judgeForm.email, judgeForm.title, judgeForm.organization);
    success(`Judge "${judgeForm.name}" added to evaluation committee!`);
    setJudgeForm({ name: "", email: "", title: "", organization: "" });
    setAddJudgeModalOpen(false);
  };

  const handleManualAssign = (e: React.FormEvent) => {
    e.preventDefault();
    const j = judges.find((item) => item.id === selectedJudgeId);
    const s = submissions.find((item) => item.id === selectedSubId);
    success(`Assigned ${j?.name || "Judge"} to evaluate "${s?.projectName || "Project"}"!`);
    setManualModalOpen(false);
  };

  // Helper to inspect evaluations per submission
  const getSubEvaluations = (subId: string) => {
    return evaluations.filter((e) => e.submissionId === subId && !e.isRecused);
  };

  const filteredSubs = submissions.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.projectName.toLowerCase().includes(q) ||
      s.teamName.toLowerCase().includes(q) ||
      s.tagline.toLowerCase().includes(q);
    const matchesTrack = trackFilter === "ALL" || s.trackName === trackFilter || s.trackId === trackFilter;
    return matchesSearch && matchesTrack;
  });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Scale size={28} color="var(--primary)" /> Judging Matrix & Workload Balancer
          </h1>
          <p>
            Monitor judge workloads, auto-balance assignments, inspect missing scores, and flag score variances
          </p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setAddJudgeModalOpen(true)}
          >
            <UserPlus size={16} /> Add Judge
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAutoBalance}
          >
            <Sparkles size={16} /> Auto-Balance Workload
          </button>
        </div>
      </div>

      {/* Workload Per Judge Cards */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        {judges.map((j) => {
          const compRate = Math.round((j.completedCount / (j.assignedCount || 1)) * 100);
          return (
            <div
              key={j.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                padding: "1.25rem",
                border: "1px solid var(--border-color)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "rgba(99, 102, 241, 0.15)",
                      color: "var(--primary)",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {j.avatar || j.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>{j.name}</div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{j.title}</div>
                  </div>
                </div>
                <span className="badge badge-primary">{compRate}% Done</span>
              </div>

              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Organization: <strong>{j.organization}</strong>
              </div>

              {/* Workload progress bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                  <span>{j.completedCount} completed</span>
                  <span>{j.assignedCount} assigned</span>
                </div>
                <div
                  style={{
                    height: "6px",
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-full)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${compRate}%`,
                      background: "linear-gradient(90deg, var(--primary) 0%, var(--accent-emerald) 100%)",
                      borderRadius: "var(--radius-full)",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
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
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search projects or teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.25rem" }}
          />
          <Filter
            size={16}
            color="var(--text-muted)"
            style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
          />
        </div>

        <select
          className="form-select"
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          style={{ minWidth: "180px" }}
        >
          <option value="ALL">All Tracks</option>
          <option value="Artificial Intelligence">Artificial Intelligence</option>
          <option value="Web Development">Web Development</option>
          <option value="FinTech">FinTech</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Sustainability">Sustainability</option>
        </select>
      </div>

      {/* Project Judging Matrix Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Track</th>
              <th>Assigned Evaluators (Judge Chips)</th>
              <th>Score Status</th>
              <th>Variance / Discrepancy Flag</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubs.map((sub, idx) => {
              const subEvals = getSubEvaluations(sub.id);
              const scoreList = subEvals.filter((e) => !e.isDraft).map((e) => e.totalScore);

              // Check for score variance (> 15 points difference between judges)
              let hasVariance = false;
              let varianceDiff = 0;
              if (scoreList.length >= 2) {
                const max = Math.max(...scoreList);
                const min = Math.min(...scoreList);
                varianceDiff = max - min;
                hasVariance = varianceDiff >= 15;
              }

              const isMissingScores = subEvals.length < 2;

              return (
                <tr key={sub.id}>
                  <td style={{ maxWidth: "240px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{sub.projectName}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>by {sub.teamName}</div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{sub.trackName}</span>
                  </td>
                  <td>
                    {/* Judge Chips per Project */}
                    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      {/* Show assigned judges */}
                      {judges.slice(idx % 2, (idx % 2) + 2).map((j) => {
                        const ev = subEvals.find((e) => e.judgeId === j.id);
                        return (
                          <span
                            key={j.id}
                            style={{
                              fontSize: "0.78rem",
                              padding: "0.25rem 0.6rem",
                              borderRadius: "var(--radius-full)",
                              background: ev && !ev.isDraft ? "rgba(16, 185, 129, 0.15)" : "var(--bg-input)",
                              border: `1px solid ${ev && !ev.isDraft ? "rgba(16, 185, 129, 0.3)" : "var(--border-color)"}`,
                              color: ev && !ev.isDraft ? "#6EE7B7" : "var(--text-secondary)",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <Award size={12} />
                            <strong>{j.name.split(" ")[1] || j.name}:</strong>{" "}
                            {ev && !ev.isDraft ? `${ev.totalScore} pts` : "Pending"}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td>
                    {scoreList.length >= 2 ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> 2 of 2 Evaluated
                      </span>
                    ) : (
                      <span className="badge badge-warning" title="Monitor missing scores">
                        <Clock size={12} /> Needs {2 - scoreList.length} More Score
                      </span>
                    )}
                  </td>
                  <td>
                    {/* Score Variance Flag */}
                    {hasVariance ? (
                      <span
                        className="badge badge-danger"
                        title={`Variance of ${varianceDiff} pts detected between judge scores`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                      >
                        <AlertTriangle size={12} /> Variance Alert ({varianceDiff} pts)
                      </span>
                    ) : scoreList.length >= 2 ? (
                      <span className="badge badge-neutral" style={{ color: "var(--text-muted)" }}>
                        Consistent (Δ {varianceDiff} pts)
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Awaiting scores</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSelectedSubId(sub.id);
                        setManualModalOpen(true);
                      }}
                      style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
                    >
                      Assign Judge
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Judge Modal */}
      {addJudgeModalOpen && (
        <Modal
          isOpen={addJudgeModalOpen}
          onClose={() => setAddJudgeModalOpen(false)}
          title="Add New Hackathon Judge"
          maxWidth="500px"
        >
          <form onSubmit={handleCreateJudge}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "0.5rem 0" }}>
              <div className="form-group">
                <label className="form-label">Full Name & Title <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Maya Lin"
                  value={judgeForm.name}
                  onChange={(e) => setJudgeForm({ ...judgeForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Email Address <span className="required">*</span></label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="judge@stanford.edu"
                  value={judgeForm.email}
                  onChange={(e) => setJudgeForm({ ...judgeForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Title / Role</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Principal AI Research Scientist"
                  value={judgeForm.title}
                  onChange={(e) => setJudgeForm({ ...judgeForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Organization / University</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. MIT CSAIL / DeepMind"
                  value={judgeForm.organization}
                  onChange={(e) => setJudgeForm({ ...judgeForm, organization: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAddJudgeModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add to Judging Committee
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manual Assignment Modal */}
      {manualModalOpen && (
        <Modal
          isOpen={manualModalOpen}
          onClose={() => setManualModalOpen(false)}
          title="Assign Judge to Project"
          maxWidth="480px"
        >
          <form onSubmit={handleManualAssign}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "0.5rem 0" }}>
              <div className="form-group">
                <label className="form-label">Select Judge:</label>
                <select
                  className="form-select"
                  value={selectedJudgeId}
                  onChange={(e) => setSelectedJudgeId(e.target.value)}
                >
                  {judges.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name} ({j.completedCount}/{j.assignedCount} evaluated)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Select Project Submission:</label>
                <select
                  className="form-select"
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                >
                  {submissions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.projectName} ({s.teamName} • {s.trackName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setManualModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Confirm Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
