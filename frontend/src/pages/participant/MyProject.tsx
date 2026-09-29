import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHackathon } from "../../context/HackathonContext";
import { useToast } from "../../context/ToastContext";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Modal } from "../../components/common/Modal";
import {
  FolderGit2,
  Edit3,
  ExternalLink,
  GitBranch,
  Video,
  Globe,
  Send,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Tag,
  Image as ImageIcon,
  Users,
  Compass,
} from "lucide-react";

export const MyProject: React.FC = () => {
  const { mySubmission, myTeam, finalizeSubmission } = useHackathon();
  const { success } = useToast();
  const navigate = useNavigate();

  const [finalizeModalOpen, setFinalizeModalOpen] = useState<boolean>(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleFinalize = () => {
    if (!mySubmission) return;
    setIsSubmitting(true);
    try {
      finalizeSubmission(mySubmission.id);
      success("Project submitted successfully! Your project is now locked for judge review.");
      setFinalizeModalOpen(false);
    } catch {
      setFinalizeModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mySubmission) {
    return (
      <div className="page-wrapper">
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            maxWidth: "600px",
            margin: "3rem auto",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
              marginBottom: "1.5rem",
            }}
          >
            <FolderGit2 size={32} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            No Project Created Yet
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem" }}>
            Create a project submission to register your hackathon solution. You can save drafts as often as you like before the deadline.
          </p>
          <Link to="/project/create" className="btn btn-primary btn-lg">
            <Sparkles size={18} /> Create Project Submission
          </Link>
        </div>
      </div>
    );
  }

  const isLocked = mySubmission.status === "Submitted" || mySubmission.status === "Under Review" || mySubmission.status === "Judged";

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
            <h1>
              <FolderGit2 size={28} color="var(--primary)" /> {mySubmission.projectName}
            </h1>
            <StatusBadge status={mySubmission.status} />
          </div>
          <p>{mySubmission.tagline}</p>
        </div>

        <div className="page-actions">
          {!isLocked ? (
            <>
              <Link to="/project/edit" className="btn btn-secondary">
                <Edit3 size={16} /> Edit Details
              </Link>
              <button className="btn btn-primary" onClick={() => setFinalizeModalOpen(true)}>
                <Send size={16} /> Finalize Submission
              </button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="badge badge-success" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Lock size={12} /> Submission Locked
              </span>
              <Link to={`/project/${mySubmission.id}`} className="btn btn-secondary btn-sm">
                <ExternalLink size={14} /> Public View
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid-sidebar">
        {/* Project Details Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Status banner */}
          {isLocked ? (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <CheckCircle size={20} color="var(--accent-emerald)" />
              <div>
                <div style={{ fontWeight: 600, color: "#6EE7B7", fontSize: "0.95rem" }}>
                  Project Officially Submitted
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Your submission has been queued for evaluation against the 5-criteria rubric.
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <Clock size={20} color="var(--accent-amber)" />
              <div>
                <div style={{ fontWeight: 600, color: "#FCD34D", fontSize: "0.95rem" }}>
                  Draft Mode (Editable)
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  You can update your code, links, and tags anytime before clicking "Finalize Submission".
                </div>
              </div>
            </div>
          )}

          {/* Description card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Project Overview & Architecture</h3>
              <span className="badge badge-primary">
                Track: {mySubmission.trackName}
              </span>
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {mySubmission.description}
            </div>
          </div>

          {/* Tech Stack Tags Card */}
          {mySubmission.techStack && mySubmission.techStack.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Tag size={18} color="var(--primary)" /> Technologies & Tools
                </h3>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {mySubmission.techStack.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "9999px",
                      padding: "0.35rem 0.85rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--primary)",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Screenshots Gallery Card */}
          {mySubmission.screenshots && mySubmission.screenshots.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <ImageIcon size={18} color="var(--primary)" /> Screenshots & Visual Demos
                </h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                {mySubmission.screenshots.map((url, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedScreenshot(url)}
                    style={{
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                      border: "1px solid var(--border-color)",
                      aspectRatio: "16 / 9",
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    <img
                      src={url}
                      alt={`Screenshot ${idx + 1}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.3)",
                        opacity: 0,
                        transition: "opacity 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                    >
                      Click to Enlarge
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deliverables Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Project Deliverables & Artifacts</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {mySubmission.repoUrl ? (
                <a
                  href={mySubmission.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ justifyContent: "flex-start" }}
                >
                  <GitBranch size={16} /> GitHub Repo
                </a>
              ) : (
                <div style={{ padding: "0.75rem", background: "var(--bg-input)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  No Repository URL
                </div>
              )}

              {mySubmission.demoUrl ? (
                <a
                  href={mySubmission.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ justifyContent: "flex-start" }}
                >
                  <Globe size={16} /> Live Demo
                </a>
              ) : (
                <div style={{ padding: "0.75rem", background: "var(--bg-input)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  No Demo URL
                </div>
              )}

              {mySubmission.videoUrl ? (
                <a
                  href={mySubmission.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ justifyContent: "flex-start" }}
                >
                  <Video size={16} /> Video Pitch
                </a>
              ) : (
                <div style={{ padding: "0.75rem", background: "var(--bg-input)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  No Video Pitch URL
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Submission Readiness */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <CheckCircle size={18} color="var(--accent-emerald)" /> Readiness Check
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Track Assigned</span>
                <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>✓ Done</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Tagline & Summary</span>
                <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>✓ Done</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Repository URL</span>
                <span style={{ color: mySubmission.repoUrl ? "var(--accent-emerald)" : "var(--accent-amber)", fontWeight: 600 }}>
                  {mySubmission.repoUrl ? "✓ Provided" : "Missing"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Live Demo</span>
                <span style={{ color: mySubmission.demoUrl ? "var(--accent-emerald)" : "var(--accent-amber)", fontWeight: 600 }}>
                  {mySubmission.demoUrl ? "✓ Provided" : "Missing"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Tech Stack Tags</span>
                <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>
                  ✓ {mySubmission.techStack?.length || 0} Tags
                </span>
              </div>
            </div>
          </div>

          {/* Author Team Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Users size={18} color="var(--primary)" /> Author Team
              </h3>
            </div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              {myTeam?.name || mySubmission.teamName}
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Active squad members working on this submission:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {(myTeam?.members || [
                { id: "m-1", name: "Alice Johnson", role: "LEADER", collegeCompany: "MIT AI Lab" },
                { id: "m-2", name: "Bob Martinez", role: "MEMBER", collegeCompany: "Stanford" },
              ]).map((member, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.5rem 0.75rem",
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{member.name}</span>
                  <span className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Finalize Modal */}
      <Modal
        isOpen={finalizeModalOpen}
        onClose={() => setFinalizeModalOpen(false)}
        title="Finalize & Submit Project for Review"
      >
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          Are you sure you want to finalize <strong>{mySubmission.projectName}</strong>? Your submission will be locked and assigned to judges for scoring.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setFinalizeModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleFinalize}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Yes, Finalize Submission"}
          </button>
        </div>
      </Modal>

      {/* Screenshot Lightbox Modal */}
      {selectedScreenshot && (
        <Modal
          isOpen={Boolean(selectedScreenshot)}
          onClose={() => setSelectedScreenshot(null)}
          title="Screenshot Preview"
        >
          <div style={{ textAlign: "center" }}>
            <img
              src={selectedScreenshot}
              alt="Enlarged screenshot"
              style={{ maxWidth: "100%", maxHeight: "70vh", borderRadius: "var(--radius-md)" }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
