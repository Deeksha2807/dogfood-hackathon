import React, { useState } from "react";
import { useHackathon } from "../../context/HackathonContext";
import { SubmissionData } from "../../data/hackathonData";
import { useToast } from "../../context/ToastContext";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Modal } from "../../components/common/Modal";
import {
  FolderGit2,
  Search,
  Filter,
  ExternalLink,
  GitBranch,
  Globe,
  Video,
  Eye,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  Tag,
  Code2,
} from "lucide-react";

export const SubmissionReview: React.FC = () => {
  const { submissions, updateSubmissionStatus, disqualifySubmission } = useHackathon();
  const { success, error, info } = useToast();

  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Detail Modal
  const [selectedSub, setSelectedSub] = useState<SubmissionData | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Disqualify Modal
  const [disqualifyModalOpen, setDisqualifyModalOpen] = useState(false);
  const [subToDisqualify, setSubToDisqualify] = useState<SubmissionData | null>(null);
  const [disqualifyReason, setDisqualifyReason] = useState("");

  const handleOpenDetail = (sub: SubmissionData) => {
    setSelectedSub(sub);
    setDetailModalOpen(true);
  };

  const handleStatusChange = (subId: string, newStatus: any) => {
    updateSubmissionStatus(subId, newStatus);
    success(`Updated status to ${newStatus}`);
    if (selectedSub && selectedSub.id === subId) {
      setSelectedSub({ ...selectedSub, status: newStatus });
    }
  };

  const handleOpenDisqualify = (sub: SubmissionData) => {
    setSubToDisqualify(sub);
    setDisqualifyReason("");
    setDisqualifyModalOpen(true);
  };

  const handleExecuteDisqualify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subToDisqualify) return;
    if (!disqualifyReason.trim()) {
      error("Please specify a reason for disqualification.");
      return;
    }

    disqualifySubmission(subToDisqualify.id, disqualifyReason.trim());
    success(`Project "${subToDisqualify.projectName}" disqualified.`);
    setDisqualifyModalOpen(false);
    if (selectedSub && selectedSub.id === subToDisqualify.id) {
      setSelectedSub({ ...selectedSub, status: "Disqualified", disqualifiedReason: disqualifyReason.trim() });
    }
  };

  const filtered = submissions.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      s.projectName.toLowerCase().includes(q) ||
      s.tagline.toLowerCase().includes(q) ||
      s.teamName.toLowerCase().includes(q) ||
      s.techStack.some((tech) => tech.toLowerCase().includes(q));

    const matchesTrack = trackFilter === "ALL" || s.trackName === trackFilter || s.trackId === trackFilter;
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;

    return matchesSearch && matchesTrack && matchesStatus;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <FolderGit2 size={28} color="var(--primary)" /> Project Submissions Review
          </h1>
          <p>
            Audit code deliverables, AI-assisted summaries, verify deliverables, and moderate project eligibility
          </p>
        </div>
      </div>

      {/* Filter Bar */}
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
            placeholder="Search by project, team, tagline, or tech stack..."
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
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            style={{ minWidth: "170px" }}
          >
            <option value="ALL">All Tracks</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Web Development">Web Development</option>
            <option value="FinTech">FinTech</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Sustainability">Sustainability</option>
          </select>

          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: "150px" }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Judged">Judged</option>
            <option value="Draft">Draft</option>
            <option value="Disqualified">Disqualified</option>
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Project Title</th>
              <th>Team</th>
              <th>Track</th>
              <th>Status</th>
              <th>Tech Stack</th>
              <th>Deliverables</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No matching submissions found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ maxWidth: "260px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.projectName}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.tagline}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{s.teamName}</span>
                  </td>
                  <td>
                    <span className="badge badge-primary">{s.trackName}</span>
                  </td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", maxWidth: "180px" }}>
                      {s.techStack.slice(0, 2).map((tech) => (
                        <span key={tech} className="badge badge-neutral" style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}>
                          {tech}
                        </span>
                      ))}
                      {s.techStack.length > 2 && (
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>+{s.techStack.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {s.demoUrl && (
                        <a href={s.demoUrl} target="_blank" rel="noreferrer" title="Live Demo" style={{ color: "var(--primary)" }}>
                          <Globe size={16} />
                        </a>
                      )}
                      {s.repoUrl && (
                        <a href={s.repoUrl} target="_blank" rel="noreferrer" title="GitHub Repo" style={{ color: "var(--text-secondary)" }}>
                          <GitBranch size={16} />
                        </a>
                      )}
                      {s.videoUrl && (
                        <a href={s.videoUrl} target="_blank" rel="noreferrer" title="Demo Video" style={{ color: "var(--accent-amber)" }}>
                          <Video size={16} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenDetail(s)}
                        style={{ padding: "0.3rem 0.65rem", fontSize: "0.75rem" }}
                      >
                        <Eye size={13} /> Review
                      </button>

                      {s.status !== "Disqualified" ? (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDisqualify(s)}
                          title="Disqualify submission"
                          style={{ padding: "0.3rem 0.5rem", fontSize: "0.75rem", color: "var(--accent-rose)" }}
                        >
                          <ShieldAlert size={13} />
                        </button>
                      ) : (
                        <span className="badge badge-danger" style={{ fontSize: "0.7rem" }}>DQ</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Project Detail Modal */}
      {detailModalOpen && selectedSub && (
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title={`Review: ${selectedSub.projectName}`}
          maxWidth="720px"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", padding: "0.5rem 0" }}>
            {/* Header info */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <div>
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700 }}>{selectedSub.projectName}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{selectedSub.tagline}</p>
                </div>
                <StatusBadge status={selectedSub.status} />
              </div>

              <div style={{ display: "flex", gap: "1rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <span>Team: <strong>{selectedSub.teamName}</strong></span>
                <span>•</span>
                <span>Track: <strong>{selectedSub.trackName}</strong></span>
                <span>•</span>
                <span>Submitted: {new Date(selectedSub.submittedAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Description */}
            <div style={{ background: "var(--bg-input)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
                Project Overview & Architecture
              </div>
              <p style={{ fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: 1.6 }}>
                {selectedSub.description}
              </p>
            </div>

            {/* Assisted AI Summary Card */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--primary)", fontWeight: 700, fontSize: "0.85rem" }}>
                <Sparkles size={16} /> Assisted Judging: AI Project Summary
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem" }}>
                <div><strong>What it does:</strong> {selectedSub.aiSummary.whatItDoes}</div>
                <div><strong>Technology used:</strong> {selectedSub.aiSummary.techUsed}</div>
                <div><strong>Repo activity:</strong> {selectedSub.aiSummary.repoActivity}</div>
                <div>
                  <strong>Key engineering highlights:</strong>
                  <ul style={{ paddingLeft: "1.25rem", marginTop: "0.25rem" }}>
                    {selectedSub.aiSummary.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                Technologies Used
              </div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {selectedSub.techStack.map((tech) => (
                  <span key={tech} className="badge badge-neutral" style={{ fontSize: "0.8rem", padding: "0.25rem 0.6rem" }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Deliverable Links */}
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
                Deliverables & Repositories
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {selectedSub.demoUrl && (
                  <a href={selectedSub.demoUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    <Globe size={14} /> Live Demo <ExternalLink size={12} />
                  </a>
                )}
                {selectedSub.repoUrl && (
                  <a href={selectedSub.repoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    <GitBranch size={14} /> GitHub Repository
                  </a>
                )}
                {selectedSub.videoUrl && (
                  <a href={selectedSub.videoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                    <Video size={14} /> Video Walkthrough
                  </a>
                )}
              </div>
            </div>

            {/* Disqualification Notice if any */}
            {selectedSub.status === "Disqualified" && selectedSub.disqualifiedReason && (
              <div style={{ padding: "0.75rem", borderRadius: "var(--radius-md)", background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.3)", color: "#FDA4AF", fontSize: "0.85rem" }}>
                <strong>Disqualification Reason:</strong> {selectedSub.disqualifiedReason}
              </div>
            )}

            {/* Status Change Control */}
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Change Status:</span>
                <select
                  className="form-select"
                  value={selectedSub.status}
                  onChange={(e) => handleStatusChange(selectedSub.id, e.target.value)}
                  style={{ minWidth: "150px" }}
                >
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Judged">Judged</option>
                  <option value="Disqualified">Disqualified</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Disqualify Confirmation Modal */}
      {disqualifyModalOpen && subToDisqualify && (
        <Modal
          isOpen={disqualifyModalOpen}
          onClose={() => setDisqualifyModalOpen(false)}
          title={`Disqualify Project: "${subToDisqualify.projectName}"`}
          maxWidth="480px"
        >
          <form onSubmit={handleExecuteDisqualify}>
            <div style={{ padding: "0.5rem 0 1rem 0" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Disqualifying this submission will remove it from judge scoring consideration and exclude it from the official results leaderboard.
              </p>

              <div className="form-group">
                <label className="form-label">
                  Reason for Disqualification <span className="required">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Plagiarism of pre-existing commercial repository, violation of code-of-conduct, incomplete deliverables..."
                  value={disqualifyReason}
                  onChange={(e) => setDisqualifyReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDisqualifyModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: "var(--accent-rose)", borderColor: "var(--accent-rose)" }}
              >
                Confirm Disqualification
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
