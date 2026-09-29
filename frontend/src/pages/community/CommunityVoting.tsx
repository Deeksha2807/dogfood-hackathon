import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { votingService } from "../../services/votingService";
import { MOCK_SUBMISSIONS } from "../../services/mockData";
import { Submission } from "../../types";
import { StatusBadge } from "../../components/common/StatusBadge";
import {
  Vote,
  Heart,
  Shuffle,
  Search,
  MessageSquare,
  Sparkles,
  Shield,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

export const CommunityVoting: React.FC = () => {
  const { user, activeEventId } = useAuth();
  const { success, error, info } = useToast();

  const [projects, setProjects] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [search, setSearch] = useState("");
  const [votedMap, setVotedMap] = useState<Record<string, boolean>>({});
  const [isRandomized, setIsRandomized] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const list = await votingService.getPublicProjects(activeEventId);
        if (list && list.length > 0) {
          setProjects(list);
        }
      } catch {}
    };
    loadProjects();
  }, [activeEventId]);

  const handleVote = async (submissionId: string) => {
    try {
      const res = await votingService.vote(submissionId, user?.id || "guest");
      setProjects((prev) =>
        prev.map((p) => (p.id === submissionId ? { ...p, voteCount: res.voteCount } : p))
      );
      setVotedMap((prev) => ({ ...prev, [submissionId]: true }));
      success("Your community vote has been counted!");
    } catch (err: any) {
      error(
        err.message || "Duplicate vote rejected: You have already voted for this project."
      );
    }
  };

  const handleShuffle = () => {
    const shuffled = [...projects].sort(() => Math.random() - 0.5);
    setProjects(shuffled);
    setIsRandomized(true);
    info("Projects randomized for fair exposure.");
  };

  const filtered = projects.filter(
    (p) =>
      p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.tagline.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Vote size={28} color="var(--primary)" /> Community Choice Voting
          </h1>
          <p>Vote for your favorite hackathon projects to decide the People's Choice Award</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleShuffle}>
            <Shuffle size={16} /> Randomize Order
          </button>
        </div>
      </div>

      {/* Voting Window Notice */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(30, 41, 59, 0.8) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          borderRadius: "var(--radius-md)",
          padding: "1.25rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Shield size={24} color="var(--primary)" />
          <div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "1rem" }}>
              Fair Voting Protocol Active
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Rate-limiting and anti-duplicate vote safeguards are enforced. Votes are tallied in real-time.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="badge badge-success">Voting Window Open</span>
        </div>
      </div>

      {/* Search Filter */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 1.25rem",
        }}
      >
        <div style={{ position: "relative", flex: 1 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search projects by title or keywords..."
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
      </div>

      {/* Showcase Grid */}
      <div className="grid-2">
        {filtered.map((p) => {
          const voted = votedMap[p.id];

          return (
            <div
              key={p.id}
              className="card"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "1.75rem",
                border: voted ? "1px solid rgba(99, 102, 241, 0.5)" : "1px solid var(--border-color)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <span className="badge badge-primary">{p.track?.name || "Track"}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {p.voteCount || 0} Votes
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                  {p.projectName}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                  {p.tagline}
                </p>

                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                  Created by <strong>{p.team?.name || "Hacker Squad"}</strong>
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Link to={`/project/${p.id}`} className="btn btn-secondary btn-sm">
                  View Story & Demo <ExternalLink size={14} />
                </Link>

                <button
                  className={`btn ${voted ? "btn-primary" : "btn-primary"}`}
                  onClick={() => handleVote(p.id)}
                  style={{
                    background: voted ? "var(--accent-emerald)" : undefined,
                  }}
                >
                  <Heart size={16} fill={voted ? "#FFFFFF" : "none"} />
                  {voted ? "Vote Cast!" : "Vote"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
