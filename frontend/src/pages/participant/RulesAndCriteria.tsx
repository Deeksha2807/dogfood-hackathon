import React from "react";
import { useHackathon } from "../../context/HackathonContext";
import {
  BookOpen,
  Scale,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Trophy,
} from "lucide-react";

export const RulesAndCriteria: React.FC = () => {
  const { criteria, eventConfig } = useHackathon();

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <BookOpen size={28} color="var(--primary)" /> Rules & Judging Criteria
          </h1>
          <p>
            Official participation guidelines, code of conduct, and transparent 5-factor scoring rubric for {eventConfig.name}.
          </p>
        </div>
      </div>

      {/* Judging Rubric Section */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="card-header">
          <h2 className="card-title">
            <Scale size={20} color="var(--primary)" /> The 5 Official Judging Criteria (100 Max Score)
          </h2>
          <span className="badge badge-primary">Standardized Rubric</span>
        </div>

        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
          Every submitted project is evaluated independently by our expert judging panel using the exact weighted rubric below. All scores are mathematically combined and statistically normalized to ensure impartiality.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {criteria.map((c) => (
            <div
              key={c.id}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div style={{ maxWidth: "800px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{c.name}</h3>
                  <span className="badge badge-success">{Math.round(c.weight * 100)}% Weight</span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {c.description}
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg-main)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.5rem 1rem",
                  textAlign: "center",
                  minWidth: "100px",
                }}
              >
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--primary)" }}>
                  {c.maxScore}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Max Points</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid-2" style={{ marginBottom: "2rem" }}>
        {/* Eligibility & Team Rules */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckCircle2 size={18} color="var(--accent-emerald)" /> Team & Code Eligibility
            </h3>
          </div>
          <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            <li>
              <strong>Team Sizes:</strong> Teams may consist of 1 to {eventConfig.maxTeamSize} registered participants. Cross-institutional teams are encouraged.
            </li>
            <li>
              <strong>Fresh Code:</strong> All code submitted for judging must be written during the 72-hour hackathon window. Open-source libraries, frameworks, APIs, and pretrained foundational models are fully permitted.
            </li>
            <li>
              <strong>Track Exclusivity:</strong> Each team may submit exactly one primary project to one designated competition track to ensure focused quality.
            </li>
            <li>
              <strong>Deliverables:</strong> A valid submission requires a public GitHub repository link, an interactive demo or deployed URL, and a 2-3 minute video walkthrough demonstration.
            </li>
          </ul>
        </div>

        {/* Code of Conduct & Integrity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <ShieldAlert size={18} color="var(--accent-rose)" /> Academic & Ethical Conduct
            </h3>
          </div>
          <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            <li>
              <strong>Zero Tolerance for Plagiarism:</strong> Copying an existing project, submitting past commercial work, or masquerading another author's repository will result in immediate disqualification.
            </li>
            <li>
              <strong>AI Tool Usage:</strong> Generative AI coding assistants (GitHub Copilot, Cursor, Gemini, Claude) are welcomed. Your team must document primary AI usage in the architecture summary.
            </li>
            <li>
              <strong>Judge Recusal:</strong> Judges must recuse themselves from evaluating any submission where they have a prior advisory, professional, or personal conflict of interest.
            </li>
            <li>
              <strong>Respect & Inclusivity:</strong> All participants, mentors, and judges must uphold a harassment-free environment across all channels and discussions.
            </li>
          </ul>
        </div>
      </div>

      {/* Submission Checklist */}
      <div className="card" style={{ background: "linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(17, 24, 39, 0.8) 100%)" }}>
        <div className="card-header">
          <h3 className="card-title">
            <Sparkles size={18} color="var(--accent-cyan)" /> Final Submission Checklist
          </h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {[
            { step: "1", title: "Public GitHub Repo", desc: "Clean commit history, README with setup instructions, and LICENSE." },
            { step: "2", title: "Live Working Demo", desc: "Hosted deployment (Vercel, Render, Railway, Cloudflare, etc.)." },
            { step: "3", title: "Video Walkthrough", desc: "Loom, YouTube, or MP4 link showcasing architecture and end-to-end user flow." },
            { step: "4", title: "Architecture & Tech Stack", desc: "Select tags for your languages, databases, models, and frameworks." },
          ].map((item, idx) => (
            <div key={idx} style={{ background: "var(--bg-card)", padding: "1rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ color: "var(--primary)", fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                REQUIREMENT {item.step}
              </div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                {item.title}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
