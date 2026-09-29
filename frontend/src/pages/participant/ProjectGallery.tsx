import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { votingService } from "../../services/votingService";
import { MOCK_SUBMISSIONS, MOCK_TRACKS } from "../../services/mockData";
import { Submission, Track } from "../../types";
import { StatusBadge } from "../../components/common/StatusBadge";
import { EmptyState } from "../../components/common/EmptyState";
import {
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  GitBranch,
  Heart,
  Users,
  Compass,
  Sparkles,
} from "lucide-react";

export const ProjectGallery: React.FC = () => {
  const { user, activeEventId } = useAuth();
  const { success, error } = useToast();

  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"recent" | "votes" | "title">("votes");
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projects = await votingService.getPublicProjects(activeEventId);
        if (projects && projects.length > 0) {
          setSubmissions(projects);
        }
      } catch {
        setSubmissions(MOCK_SUBMISSIONS);
      }
    };
    loadProjects();
  }, [activeEventId]);

  const handleVote = async (submissionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await votingService.vote(submissionId, user?.id || "guest");
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, voteCount: res.voteCount } : s))
      );
      setVotedMap((prev) => ({ ...prev, [submissionId]: true }));
      success("Vote recorded successfully! Thank you for supporting this project.");
    } catch (err: any) {
      error(err.message || "Failed to submit community vote.");
    }
  };

  const filtered = submissions
    .filter((s) => {
      const matchesSearch =
        s.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTrack = selectedTrack === "ALL" || s.trackId === selectedTrack;
      return matchesSearch && matchesTrack;
    })
    .sort((a, b) => {
      if (sortBy === "votes") return (b.voteCount || 0) - (a.voteCount || 0);
      if (sortBy === "title") return a.projectName.localeCompare(b.projectName);
      return new Date(b.submittedAt || b.createdAt || "").getTime() - new Date(a.submittedAt || a.createdAt || "").getTime();
    });

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Layers size={28} color="var(--primary)" /> Project Gallery
          </h1>
          <p>Explore innovative projects built by talented hacker teams</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: "2rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 1.25rem",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search projects, keywords, or tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: "2.25rem" }}
          />
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
          />
        </div>

        {/* Track Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            style={{ minWidth: "180px" }}
          >
            <option value="ALL">All Tracks</option>
            {MOCK_TRACKS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ArrowUpDown size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{ minWidth: "160px" }}
          >
            <option value="votes">Most Voted</option>
            <option value="recent">Recently Added</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Project Grid */}
      {filtered.length > 0 ? (
        <div className="grid-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              to={`/project/${item.id}`}
              className="card"
              style={{
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "1.5rem",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <span className="badge badge-primary">
                    {item.track?.name || "AI Agents"}
                  </span>
                  <StatusBadge status={item.status} />
                </div>

                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  {item.projectName}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1rem" }}>
                  {item.tagline}
                </p>
              </div>

              <div>
                {/* Team Info */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                  <Users size={14} />
                  <span>{item.team?.name || "Hacker Team"}</span>
                </div>

                {/* Footer Controls */}
                <div
                  style={{
                    borderTop: "1px solid var(--border-subtle)",
                    paddingTop: "0.75rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <button
                    className={`btn ${votedMap[item.id] ? "btn-primary" : "btn-secondary"} btn-sm`}
                    onClick={(e) => handleVote(item.id, e)}
                  >
                    <Heart size={14} fill={votedMap[item.id] ? "#FFFFFF" : "none"} />
                    <span>{item.voteCount || 0} Votes</span>
                  </button>

                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontSize: "0.8rem",
                      color: "var(--primary)",
                      fontWeight: 600,
                    }}
                  >
                    View Project <ExternalLink size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects match your filter"
          description="Try modifying your search query or selecting another challenge track."
          actionText="Clear Filters"
          onAction={() => {
            setSearchQuery("");
            setSelectedTrack("ALL");
          }}
        />
      )}
    </div>
  );
};
