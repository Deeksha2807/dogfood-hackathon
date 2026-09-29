import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { votingService } from "../../services/votingService";
import { submissionService } from "../../services/submissionService";
import { MOCK_SUBMISSIONS } from "../../services/mockData";
import { Submission, ProjectComment } from "../../types";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import {
  ArrowLeft,
  GitBranch,
  Globe,
  Video,
  Heart,
  MessageSquare,
  Send,
  Users,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, activeEventId } = useAuth();
  const { success, error } = useToast();

  const [project, setProject] = useState<Submission | null>(null);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPosting, setIsPosting] = useState<boolean>(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        if (id) {
          const res = await submissionService.getSubmission(activeEventId, id);
          setProject(res.submission);
        } else {
          setProject(MOCK_SUBMISSIONS[0]);
        }
      } catch {
        const found = MOCK_SUBMISSIONS.find((s) => s.id === id) || MOCK_SUBMISSIONS[0];
        setProject(found);
      } finally {
        setIsLoading(false);
      }
    };

    const loadComments = async () => {
      if (id) {
        const list = await votingService.getComments(id);
        setComments(list);
        const voted = await votingService.hasVoted(id, user?.id || "guest");
        setHasVoted(voted);
      }
    };

    loadProject();
    loadComments();
  }, [id, activeEventId, user?.id]);

  const handleVote = async () => {
    if (!project) return;
    try {
      const res = await votingService.vote(project.id, user?.id || "guest");
      setProject((prev) => (prev ? { ...prev, voteCount: res.voteCount } : null));
      setHasVoted(true);
      success("Your community vote has been cast!");
    } catch (err: any) {
      error(err.message || "Could not cast vote.");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !project) return;

    setIsPosting(true);
    try {
      const created = await votingService.addComment(
        project.id,
        user?.name || "Hacker",
        newComment.trim()
      );
      setComments((prev) => [...prev, created]);
      setNewComment("");
      success("Comment posted!");
    } catch (err: any) {
      error(err.message || "Failed to post comment.");
    } finally {
      setIsPosting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullPage message="Loading project showcase..." />;
  }

  if (!project) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Project Not Found</h2>
          <Link to="/gallery" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Return to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      {/* Top back navigation */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Link
          to="/gallery"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", fontSize: "0.875rem", textDecoration: "none" }}
        >
          <ArrowLeft size={16} /> Back to Project Gallery
        </Link>
      </div>

      {/* Main Header Card */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)",
          borderColor: "rgba(99, 102, 241, 0.3)",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span className="badge badge-primary">{project.track?.name || "Challenge Track"}</span>
              <StatusBadge status={project.status} />
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
              {project.projectName}
            </h1>
            <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", maxWidth: "700px" }}>
              {project.tagline}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              className={`btn ${hasVoted ? "btn-primary" : "btn-secondary"} btn-lg`}
              onClick={handleVote}
            >
              <Heart size={18} fill={hasVoted ? "#FFFFFF" : "none"} />
              <span>{hasVoted ? "Voted" : "Vote for Project"}</span>
              <span className="badge badge-neutral" style={{ marginLeft: "4px" }}>
                {project.voteCount || 0}
              </span>
            </button>
          </div>
        </div>

        {/* Deliverable Action Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
              <Globe size={16} /> Launch Live Demo <ExternalLink size={14} />
            </a>
          )}
          {project.repoUrl && (
            <a href={project.repoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <GitBranch size={16} /> View Source Code
            </a>
          )}
          {project.videoUrl && (
            <a href={project.videoUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
              <Video size={16} /> Watch Pitch Video
            </a>
          )}
        </div>
      </div>

      {/* Content & Sidebar */}
      <div className="grid-sidebar">
        {/* Left: Description & Comments */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Detailed Description */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Project Story & Architecture</h3>
            </div>
            <div style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {project.description}
            </div>
          </div>

          {/* Comments / Discussion */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <MessageSquare size={18} color="var(--primary)" /> Community Discussions ({comments.length})
              </h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} style={{ marginBottom: "1.5rem" }}>
              <div className="form-group">
                <textarea
                  className="form-textarea"
                  placeholder="Leave constructive feedback, questions, or praise for this hacker project..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  required
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isPosting}>
                  <Send size={14} /> {isPosting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>

            {/* Comment List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  style={{
                    padding: "1rem",
                    background: "var(--bg-input)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      {comment.authorName}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Team & Metadata */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Team Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Users size={18} color="var(--primary)" /> Built by {project.team?.name || "Hacker Team"}
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {project.team?.members?.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                    color: "var(--text-primary)",
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "var(--bg-card-hover)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {m.user?.name ? m.user.name.charAt(0) : "M"}
                  </div>
                  <span>{m.user?.name || "Team Member"}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Track Criteria Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Track Alignment</h3>
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <strong>{project.track?.name}</strong>: {project.track?.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
