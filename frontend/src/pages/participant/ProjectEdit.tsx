import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useHackathon } from "../../context/HackathonContext";
import { useToast } from "../../context/ToastContext";
import {
  FolderGit2,
  Save,
  Send,
  ArrowLeft,
  GitBranch,
  Globe,
  Video,
  FileText,
  Compass,
  Users,
  Tag,
  Plus,
  X,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const SUGGESTED_TAGS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Prisma",
  "Docker",
  "Tailwind CSS",
  "FastAPI",
  "Next.js",
  "Gemini API",
  "PyTorch",
  "WebSockets",
  "GraphQL",
];

const DEFAULT_SAMPLE_SCREENSHOTS = [
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80",
];

export const ProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { tracks, myTeam, mySubmission, saveSubmissionDraft, finalizeSubmission } = useHackathon();
  const { success, error, info } = useToast();
  const navigate = useNavigate();

  const [trackId, setTrackId] = useState<string>(tracks[0]?.id || "track-1");
  const [projectName, setProjectName] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [repoUrl, setRepoUrl] = useState<string>("");
  const [demoUrl, setDemoUrl] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [techStack, setTechStack] = useState<string[]>(["React", "TypeScript", "Python", "PostgreSQL"]);
  const [tagInput, setTagInput] = useState<string>("");
  const [screenshots, setScreenshots] = useState<string[]>(DEFAULT_SAMPLE_SCREENSHOTS);
  const [screenshotInput, setScreenshotInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (mySubmission) {
      setProjectName(mySubmission.projectName || "");
      setTagline(mySubmission.tagline || "");
      setDescription(mySubmission.description || "");
      setTrackId(mySubmission.trackId || tracks[0]?.id || "track-1");
      setRepoUrl(mySubmission.repoUrl || "");
      setDemoUrl(mySubmission.demoUrl || "");
      setVideoUrl(mySubmission.videoUrl || "");
      if (mySubmission.techStack && mySubmission.techStack.length > 0) {
        setTechStack(mySubmission.techStack);
      }
      if (mySubmission.screenshots && mySubmission.screenshots.length > 0) {
        setScreenshots(mySubmission.screenshots);
      }
    }
  }, [mySubmission, tracks]);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (techStack.includes(trimmed)) {
      info(`"${trimmed}" is already added.`);
      return;
    }
    setTechStack((prev) => [...prev, trimmed]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTechStack((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleAddScreenshot = () => {
    if (!screenshotInput.trim()) return;
    if (!validateUrl(screenshotInput.trim())) {
      error("Please enter a valid image URL (e.g. https://.../screenshot.png)");
      return;
    }
    setScreenshots((prev) => [...prev, screenshotInput.trim()]);
    setScreenshotInput("");
    success("Screenshot URL added!");
  };

  const handleRemoveScreenshot = (idx: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (isDraft: boolean) => {
    if (!projectName.trim()) {
      error("Project Name is required.");
      return;
    }
    if (!tagline.trim()) {
      error("Project Tagline is required.");
      return;
    }
    if (!description.trim()) {
      error("Project Description is required.");
      return;
    }
    if (repoUrl && !validateUrl(repoUrl)) {
      error("Invalid GitHub Repository URL format.");
      return;
    }
    if (demoUrl && !validateUrl(demoUrl)) {
      error("Invalid Demo URL format.");
      return;
    }
    if (videoUrl && !validateUrl(videoUrl)) {
      error("Invalid Video Walkthrough URL format.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedTrack = tracks.find((t) => t.id === trackId) || tracks[0];

      saveSubmissionDraft({
        projectName: projectName.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        trackId: selectedTrack.id,
        trackName: selectedTrack.name,
        repoUrl: repoUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
        videoUrl: videoUrl.trim() || undefined,
        techStack,
        screenshots,
      });

      if (!isDraft && mySubmission) {
        finalizeSubmission(mySubmission.id);
        success("Project officially submitted for judging! Your entry is now in review.");
      } else {
        success("Project draft saved successfully! You can keep refining until the deadline.");
      }

      navigate("/project");
    } catch (err: any) {
      error(err.message || "Failed to save project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const teamName = myTeam?.name || "Team AlphaForge";

  return (
    <div className="page-wrapper" style={{ maxWidth: "920px" }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <Link
            to="/project"
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
            <ArrowLeft size={14} /> Back to Project Overview
          </Link>
          <h1>
            <FolderGit2 size={28} color="var(--primary)" />{" "}
            {id || mySubmission ? "Edit Project Submission" : "Create New Project Submission"}
          </h1>
          <p>Complete project architecture, deliverables, tech-stack tags, and media for judge evaluation</p>
        </div>

        <div className="page-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
          >
            <Save size={16} /> Save Draft
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
          >
            <Send size={16} /> Finalize & Submit
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Team Auto Banner */}
        <div
          style={{
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                Authoring Team (Auto-Assigned)
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {teamName}
              </div>
            </div>
          </div>
          <span className="badge badge-success">Verified Squad</span>
        </div>

        {/* Track Selection */}
        <div className="form-group">
          <label className="form-label" htmlFor="track-select">
            Challenge Track <span className="required">*</span>
          </label>
          <div style={{ position: "relative" }}>
            <select
              id="track-select"
              className="form-select"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              required
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <span className="form-hint">Choose the track that best aligns with your problem statement.</span>
        </div>

        {/* Project Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="project-name">
            Project Name <span className="required">*</span>
          </label>
          <input
            id="project-name"
            type="text"
            className="form-input"
            placeholder="e.g. AgentForge AutoPilot"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        {/* Tagline */}
        <div className="form-group">
          <label className="form-label" htmlFor="tagline">
            Short Tagline / Pitch <span className="required">*</span>
          </label>
          <input
            id="tagline"
            type="text"
            className="form-input"
            placeholder="e.g. Autonomous multi-agent orchestration for end-to-end fullstack code generation."
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            required
            maxLength={160}
          />
          <span className="form-hint">A concise 1-sentence description that summarizes your solution.</span>
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Detailed Project Description & Architecture <span className="required">*</span>
          </label>
          <textarea
            id="description"
            className="form-textarea"
            placeholder="Explain what problem your project solves, how you built it, the architecture & tech stack used, challenges faced, and future roadmap..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            required
          />
        </div>

        {/* Tech-Stack Tags */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <Tag size={18} color="var(--primary)" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Tech Stack Tags</h3>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Add frameworks, libraries, cloud tools, or AI models powering your project.
          </p>

          {/* Current Tags Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
            {techStack.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "9999px",
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--primary)",
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                  title={`Remove ${tag}`}
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>

          {/* Tag Input */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <input
              type="text"
              className="form-input"
              placeholder="Add custom tag (e.g. Supabase, LangChain, Flutter)..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag(tagInput);
                }
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleAddTag(tagInput)}
            >
              <Plus size={16} /> Add
            </button>
          </div>

          {/* Quick Suggestions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Suggested:</span>
            {SUGGESTED_TAGS.filter((s) => !techStack.includes(s)).slice(0, 7).map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddTag(sug)}
                style={{
                  background: "transparent",
                  border: "1px dashed var(--border-subtle)",
                  borderRadius: "9999px",
                  padding: "0.2rem 0.6rem",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                + {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Screenshots Section */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <ImageIcon size={18} color="var(--primary)" />
            <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Project Screenshots & Visual Media</h3>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Provide public image URLs demonstrating your application UI, dashboards, and workflows.
          </p>

          {/* Screenshot Input */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <input
              type="url"
              className="form-input"
              placeholder="Paste image URL (e.g. https://images.unsplash.com/... or https://i.imgur.com/...)"
              value={screenshotInput}
              onChange={(e) => setScreenshotInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddScreenshot();
                }
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddScreenshot}
            >
              <Plus size={16} /> Add Image
            </button>
          </div>

          {/* Screenshot Previews */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {screenshots.map((url, idx) => (
              <div
                key={idx}
                style={{
                  position: "relative",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  border: "1px solid var(--border-color)",
                  aspectRatio: "16 / 9",
                  background: "#000000",
                }}
              >
                <img
                  src={url}
                  alt={`Screenshot ${idx + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80";
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveScreenshot(idx)}
                  style={{
                    position: "absolute",
                    top: "0.4rem",
                    right: "0.4rem",
                    background: "rgba(0, 0, 0, 0.7)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  title="Remove screenshot"
                >
                  <X size={14} />
                </button>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "0.25rem 0.5rem",
                    background: "rgba(0,0,0,0.6)",
                    fontSize: "0.7rem",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  Screenshot {idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deliverable URLs */}
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem" }}>
            Deliverables & Artifact Links
          </h3>

          <div className="form-group">
            <label className="form-label" htmlFor="repo-url">
              GitHub Repository URL
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="repo-url"
                type="url"
                className="form-input"
                placeholder="https://github.com/your-username/your-repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                style={{ paddingLeft: "2.25rem" }}
              />
              <GitBranch
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
            <span className="form-hint">Public repository containing your code and README instructions.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="demo-url">
              Live Demo / Website URL
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="demo-url"
                type="url"
                className="form-input"
                placeholder="https://your-project-demo.vercel.app"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                style={{ paddingLeft: "2.25rem" }}
              />
              <Globe
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
            <span className="form-hint">Working deployment link where judges can interact with your app.</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="video-url">
              Video Walkthrough / Demo Pitch URL
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="video-url"
                type="url"
                className="form-input"
                placeholder="https://youtube.com/watch?v=... or Loom URL"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                style={{ paddingLeft: "2.25rem" }}
              />
              <Video
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
            <span className="form-hint">A 2-3 minute presentation showcasing architecture and demonstration.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
          >
            <Save size={16} /> Save Draft
          </button>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
          >
            <Send size={18} /> Finalize & Submit Project
          </button>
        </div>
      </div>
    </div>
  );
};
