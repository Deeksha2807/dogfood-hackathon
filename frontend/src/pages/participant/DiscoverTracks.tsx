import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useHackathon } from "../../context/HackathonContext";
import { MOCK_PRIZES } from "../../services/mockData";
import { Compass, Trophy, ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export const DiscoverTracks: React.FC = () => {
  const { tracks } = useHackathon();
  const [prizes] = useState(MOCK_PRIZES);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Compass size={28} color="var(--primary)" /> Discover Challenge Tracks
          </h1>
          <p>Explore all competition categories, problem statements, and prize pools</p>
        </div>
      </div>

      {/* Prize Pool Highlights */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(30, 41, 59, 0.9) 100%)",
          borderColor: "rgba(245, 158, 11, 0.3)",
          padding: "1.75rem",
          marginBottom: "2.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
          <Trophy size={22} color="var(--accent-amber)" />
          <h2 style={{ fontSize: "1.35rem", fontWeight: 700 }}>Total Prize Pool: $18,000+ USD</h2>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.25rem", maxWidth: "700px" }}>
          Cash bounties and category awards awarded to top innovative solutions evaluated by our industry expert judges.
        </p>

        <div className="grid-3">
          {prizes.map((p) => (
            <div
              key={p.id}
              style={{
                background: "var(--bg-input)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--accent-amber)", marginBottom: "0.25rem" }}>
                ${p.amount.toLocaleString()}
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                {p.name}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {p.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tracks List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {tracks.map((track, idx) => (
          <div key={track.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: "0.5rem" }}>
                  Track 0{idx + 1}
                </span>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 700 }}>{track.name}</h3>
              </div>
              <Link to="/project" className="btn btn-primary">
                Build for this Track <ArrowRight size={16} />
              </Link>
            </div>

            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              {track.description}
            </p>

            <div
              style={{
                background: "var(--bg-input)",
                padding: "0.875rem 1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
              }}
            >
              <CheckCircle size={16} color="var(--primary)" />
              <span>
                <strong>Evaluation Criteria:</strong> {track.criteria || "Technical Execution, Usability, Innovation, Impact"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
