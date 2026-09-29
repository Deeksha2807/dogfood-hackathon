import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useHackathon } from "../../context/HackathonContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { SubmissionData } from "../../data/hackathonData";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Modal } from "../../components/common/Modal";
import {
  Award,
  ArrowLeft,
  GitBranch,
  Globe,
  Video,
  Save,
  Send,
  Lock,
  Sliders,
  CheckCircle,
  ExternalLink,
  Scale,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Info,
  Layers,
  Code2,
  FileText,
} from "lucide-react";

export const JudgeEvaluate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const {
    submissions,
    evaluations,
    criteria,
    saveEvaluation,
    recuseJudgeFromSubmission,
  } = useHackathon();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  // Find target submission
  const submission = submissions.find((s) => s.id === id) || submissions[0];

  // Active Judge ID
  const isJudge2 = user?.email?.includes("judge2") || user?.id?.includes("judge-2");
  const isJudge3 = user?.email?.includes("judge3") || user?.id?.includes("judge-3");
  const activeJudgeId = isJudge3 ? "judge-3" : isJudge2 ? "judge-2" : "judge-1";

  // Existing evaluation if any
  const existingEval = evaluations.find(
    (e) => e.judgeId === activeJudgeId && e.submissionId === submission.id
  );

  // Scores state: Innovation 25, Technical 25, Impact 20, UX 15, Presentation 15
  const [scores, setScores] = useState({
    innovation: existingEval?.scores?.innovation ?? 22,
    technical: existingEval?.scores?.technical ?? 23,
    impact: existingEval?.scores?.impact ?? 17,
    ux: existingEval?.scores?.ux ?? 13,
    presentation: existingEval?.scores?.presentation ?? 12,
  });

  const [feedback, setFeedback] = useState(
    existingEval?.feedback ??
      "Strong technical architecture and sub-second sandbox execution. Clean documentation and great demo walkthrough."
  );
  const [isDraft, setIsDraft] = useState(existingEval?.isDraft ?? false);
  const [isRecused, setIsRecused] = useState(existingEval?.isRecused ?? false);
  const [showAiSummary, setShowAiSummary] = useState(true);

  // Recusal Modal
  const [recuseModalOpen, setRecuseModalOpen] = useState(false);
  const [recuseReason, setRecuseReason] = useState("");

  const calculateWeightedTotal = (): number => {
    // Formula: sum of criterion scores (weights: 25, 25, 20, 15, 15 directly sum to 100)
    const total =
      Number(scores.innovation || 0) +
      Number(scores.technical || 0) +
      Number(scores.impact || 0) +
      Number(scores.ux || 0) +
      Number(scores.presentation || 0);
    return Math.round(total * 10) / 10;
  };

  const weightedTotal = calculateWeightedTotal();

  const handleScoreChange = (criterionKey: keyof typeof scores, val: number) => {
    setScores((prev) => ({
      ...prev,
      [criterionKey]: val,
    }));
  };

  const handleSave = (draftMode: boolean) => {
    saveEvaluation(activeJudgeId, submission.id, scores, feedback, draftMode);
    setIsDraft(draftMode);
    success(draftMode ? "Evaluation draft saved!" : "Evaluation submitted and finalized!");
    navigate("/judge/projects");
  };

  const handleExecuteRecuse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recuseReason.trim()) {
      error("Please provide a reason for recusal (e.g. personal affiliation, advisory role).");
      return;
    }
    recuseJudgeFromSubmission(activeJudgeId, submission.id, recuseReason.trim());
    setIsRecused(true);
    setRecuseModalOpen(false);
    info("You have recused yourself from evaluating this submission. An alternate judge will be assigned.");
    navigate("/judge/projects");
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <Link
            to="/judge/projects"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              textDecoration: "none",
              marginBottom: "0.5rem",
            }}
          >
            <ArrowLeft size={14} /> Back to Assigned Queue
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <h1>
              <Award size={28} color="var(--primary)" /> Evaluate: {submission.projectName}
            </h1>
            <span className="badge badge-primary">{submission.trackName}</span>
            {isRecused ? (
              <span className="badge badge-danger">Recused (Conflict of Interest)</span>
            ) : existingEval && !existingEval.isDraft ? (
              <span className="badge badge-success">Evaluated ({existingEval.totalScore}/100)</span>
            ) : (
              <span className="badge badge-warning">Draft in Progress</span>
            )}
          </div>
          <p>{submission.tagline}</p>
        </div>

        <div className="page-actions">
          {!isRecused && (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRecuseModalOpen(true)}
                style={{ color: "var(--accent-rose)", borderColor: "rgba(244, 63, 94, 0.3)" }}
              >
                <ShieldAlert size={16} /> Recuse (Conflict of Interest)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleSave(true)}
              >
                <Save size={16} /> Save Draft
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSave(false)}
              >
                <Send size={16} /> Submit Final Score
              </button>
            </>
          )}
        </div>
      </div>

      {isRecused && (
        <div
          className="card"
          style={{
            background: "rgba(244, 63, 94, 0.08)",
            border: "1px solid rgba(244, 63, 94, 0.3)",
            marginBottom: "1.5rem",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <ShieldAlert size={22} color="var(--accent-rose)" />
          <div>
            <div style={{ fontWeight: 700, color: "#FDA4AF", fontSize: "0.95rem" }}>
              Recused from Evaluation
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              You have formally recused yourself from scoring this project to maintain strict conflict-of-interest standards.
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid-sidebar">
        {/* Left Column: Scoring Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Rubric Criteria Sliders */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Sliders size={18} color="var(--primary)" /> Official 5-Criteria Judging Panel
              </h3>
              <span className="badge badge-primary">Normalized 100-Point Scale</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* 1. Innovation 25 */}
              <div
                style={{
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Innovation & Originality
                      </h4>
                      <span className="badge badge-primary">Weight: 25%</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                      Novelty of solution, creative angle, out-of-the-box system design, and competitive differentiation.
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                    <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                      {scores.innovation}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/ 25</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={25}
                  step={0.5}
                  value={scores.innovation}
                  onChange={(e) => handleScoreChange("innovation", parseFloat(e.target.value))}
                  disabled={isRecused}
                  style={{ width: "100%", accentColor: "var(--primary)", cursor: isRecused ? "not-allowed" : "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  <span>0.0 Min</span>
                  <span>12.5 Median</span>
                  <span>25.0 Max</span>
                </div>
              </div>

              {/* 2. Technical Implementation 25 */}
              <div
                style={{
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Technical Implementation
                      </h4>
                      <span className="badge badge-primary">Weight: 25%</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                      Architectural complexity, code cleanliness, robust error handling, test coverage, and execution reliability.
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                    <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                      {scores.technical}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/ 25</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={25}
                  step={0.5}
                  value={scores.technical}
                  onChange={(e) => handleScoreChange("technical", parseFloat(e.target.value))}
                  disabled={isRecused}
                  style={{ width: "100%", accentColor: "var(--primary)", cursor: isRecused ? "not-allowed" : "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  <span>0.0 Min</span>
                  <span>12.5 Median</span>
                  <span>25.0 Max</span>
                </div>
              </div>

              {/* 3. Real-World Impact 20 */}
              <div
                style={{
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Real-World Impact
                      </h4>
                      <span className="badge badge-primary">Weight: 20%</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                      Depth of problem solved, target addressable audience, market feasibility, and commercial/societal utility.
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                    <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                      {scores.impact}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/ 20</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={20}
                  step={0.5}
                  value={scores.impact}
                  onChange={(e) => handleScoreChange("impact", parseFloat(e.target.value))}
                  disabled={isRecused}
                  style={{ width: "100%", accentColor: "var(--primary)", cursor: isRecused ? "not-allowed" : "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  <span>0.0 Min</span>
                  <span>10.0 Median</span>
                  <span>20.0 Max</span>
                </div>
              </div>

              {/* 4. User Experience (UX) 15 */}
              <div
                style={{
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        User Experience (UX)
                      </h4>
                      <span className="badge badge-primary">Weight: 15%</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                      Visual polish, intuitive navigation, accessibility standards, responsive ergonomics, and micro-interactions.
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                    <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                      {scores.ux}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/ 15</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={scores.ux}
                  onChange={(e) => handleScoreChange("ux", parseFloat(e.target.value))}
                  disabled={isRecused}
                  style={{ width: "100%", accentColor: "var(--primary)", cursor: isRecused ? "not-allowed" : "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  <span>0.0 Min</span>
                  <span>7.5 Median</span>
                  <span>15.0 Max</span>
                </div>
              </div>

              {/* 5. Presentation & Demo 15 */}
              <div
                style={{
                  background: "var(--bg-input)",
                  borderRadius: "var(--radius-md)",
                  padding: "1.25rem",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        Presentation & Demo
                      </h4>
                      <span className="badge badge-primary">Weight: 15%</span>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                      Clarity of pitch, video demonstration effectiveness, working demo reliability, and repository documentation.
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                    <span style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                      {scores.presentation}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/ 15</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={scores.presentation}
                  onChange={(e) => handleScoreChange("presentation", parseFloat(e.target.value))}
                  disabled={isRecused}
                  style={{ width: "100%", accentColor: "var(--primary)", cursor: isRecused ? "not-allowed" : "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                  <span>0.0 Min</span>
                  <span>7.5 Median</span>
                  <span>15.0 Max</span>
                </div>
              </div>
            </div>
          </div>

          {/* Written Feedback Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FileText size={18} color="var(--primary)" /> Written Judicial Feedback
              </h3>
            </div>
            <div className="form-group">
              <label className="form-label">
                Constructive observations for {submission.teamName}:
              </label>
              <textarea
                className="form-textarea"
                placeholder="Detail technical strengths, architecture highlights, or recommended post-hackathon directions..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                disabled={isRecused}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Score Summary & Project Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Live Weighted Composite Score Display */}
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(30, 41, 59, 0.95) 100%)",
              borderColor: "rgba(99, 102, 241, 0.4)",
              textAlign: "center",
              padding: "1.75rem 1.5rem",
            }}
          >
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Composite Judging Score
            </span>
            <div style={{ fontSize: "3.25rem", fontWeight: 900, color: "var(--primary)", fontFamily: "var(--font-mono)", margin: "0.25rem 0" }}>
              {weightedTotal.toFixed(1)}
            </div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              out of 100.00 maximum points
            </span>

            {/* Live 5-Criteria Contribution List */}
            <div style={{ marginTop: "1.25rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "left", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Innovation:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{scores.innovation} / 25 pts</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Technical:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{scores.technical} / 25 pts</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Impact:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{scores.impact} / 20 pts</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>UX:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{scores.ux} / 15 pts</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Presentation:</span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{scores.presentation} / 15 pts</span>
              </div>
            </div>
          </div>

          {/* Assisted Judging: AI Project Summary */}
          {submission.aiSummary && (
            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)",
                borderColor: "rgba(99, 102, 241, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  marginBottom: showAiSummary ? "0.75rem" : 0,
                }}
                onClick={() => setShowAiSummary(!showAiSummary)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Sparkles size={16} color="var(--primary)" />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--primary)" }}>
                    Assisted Judging: AI Summary
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {showAiSummary ? "Collapse" : "Expand"}
                </span>
              </div>

              {showAiSummary && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.825rem", color: "var(--text-secondary)" }}>
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>What it does:</strong>{" "}
                    {submission.aiSummary.whatItDoes}
                  </div>
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>Tech Stack:</strong>{" "}
                    {submission.aiSummary.techUsed}
                  </div>
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>Repo Activity:</strong>{" "}
                    {submission.aiSummary.repoActivity}
                  </div>
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>Key Highlights:</strong>
                    <ul style={{ paddingLeft: "1.1rem", marginTop: "0.2rem" }}>
                      {submission.aiSummary.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginTop: "0.5rem", padding: "0.4rem 0.6rem", borderRadius: "var(--radius-sm)", background: "rgba(99, 102, 241, 0.1)", fontSize: "0.75rem", color: "var(--primary)" }}>
                    <Info size={12} style={{ display: "inline", marginRight: "4px" }} />
                    Assisted intelligence synopsis for accelerated review. The human judge always assigns final scores.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Project Deliverables Links */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Project Deliverables</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {submission.demoUrl && (
                <a
                  href={submission.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ justifyContent: "flex-start" }}
                >
                  <Globe size={16} /> Open Live Demo <ExternalLink size={14} style={{ marginLeft: "auto" }} />
                </a>
              )}
              {submission.repoUrl && (
                <a
                  href={submission.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ justifyContent: "flex-start" }}
                >
                  <GitBranch size={16} /> Inspect GitHub Source Code <ExternalLink size={14} style={{ marginLeft: "auto" }} />
                </a>
              )}
              {submission.videoUrl && (
                <a
                  href={submission.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ justifyContent: "flex-start" }}
                >
                  <Video size={16} /> Watch Video Walkthrough <ExternalLink size={14} style={{ marginLeft: "auto" }} />
                </a>
              )}
            </div>

            {/* Screenshots preview */}
            {submission.screenshots && submission.screenshots.length > 0 && (
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.5rem" }}>
                  Project Screenshots
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" }}>
                  {submission.screenshots.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Screenshot"
                      style={{
                        width: "100%",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recusal Confirmation Modal */}
      {recuseModalOpen && (
        <Modal
          isOpen={recuseModalOpen}
          onClose={() => setRecuseModalOpen(false)}
          title="Declare Recusal / Conflict of Interest"
          maxWidth="500px"
        >
          <form onSubmit={handleExecuteRecuse}>
            <div style={{ padding: "0.5rem 0 1rem 0" }}>
              <div
                style={{
                  background: "rgba(244, 63, 94, 0.1)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                  fontSize: "0.85rem",
                  color: "#FDA4AF",
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Ethical Integrity Rule:</strong> Judges must recuse themselves from scoring projects where they hold personal, academic, or financial ties with team members.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Reason for Recusal <span className="required">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Previous co-worker or student on this team, shared commercial investment, mentor conflict..."
                  value={recuseReason}
                  onChange={(e) => setRecuseReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRecuseModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ background: "var(--accent-rose)", borderColor: "var(--accent-rose)" }}
              >
                Confirm Recusal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
