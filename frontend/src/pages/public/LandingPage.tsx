import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHackathon } from "../../context/HackathonContext";
import {
  Code2,
  Shield,
  Award,
  Users,
  Layers,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Trophy,
  Clock,
  Scale,
  Compass,
  Cpu,
  Globe,
  Coins,
  HeartPulse,
  Leaf,
  ChevronDown,
  ChevronUp,
  LogIn,
  ExternalLink,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { eventConfig, tracks, criteria, loginWithGoogle, switchRole, user } = useHackathon();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleGoogleLogin = async (roleOverride?: "ADMIN" | "JUDGE" | "PARTICIPANT") => {
    if (roleOverride) {
      switchRole(roleOverride);
      if (roleOverride === "ADMIN") navigate("/admin");
      else if (roleOverride === "JUDGE") navigate("/judge");
      else navigate("/dashboard");
    } else {
      await loginWithGoogle();
      navigate("/dashboard");
    }
  };

  const faqs = [
    {
      q: "What makes HackForge different from other hackathon platforms?",
      a: "HackForge unifies the fragmented hackathon workflow into one automated operating system. Rather than managing Google Sheets, Typeforms, and Discord threads, everything—from team formation and track locking to multi-judge weighted rubric scoring and score normalization—happens in real time under one roof.",
    },
    {
      q: "How does the Automated Judging Engine work?",
      a: "Submissions are evaluated against 5 calibrated criteria (Innovation 25%, Technical 25%, Impact 20%, UX 15%, Presentation 15%). The platform automatically computes weighted scores, flags inter-judge variances, supports conflict-of-interest recusal, and provides AI-powered summaries to assist review.",
    },
    {
      q: "Who can see my submission before judging closes?",
      a: "HackForge enforces strict role-based access control. Participants can only see and edit their own team's draft and submission. Judges only see projects assigned to their workload. Organizers have total oversight and can monitor submission integrity and score calculation.",
    },
    {
      q: "What is the team size and eligibility?",
      a: "Teams can have up to 4 members. You can register individually and use the in-app Team Formation tools to share invite codes, merge squads, or be matched with teammates by organizers.",
    },
    {
      q: "When are results and rankings made public?",
      a: "Results are locked until the administrative team completes multi-judge verification and toggles the official 'Publish Results' switch. Once published, all participants gain access to the interactive leaderboard, rank breakdowns, and written feedback.",
    },
  ];

  const trackIcons: Record<string, React.ReactNode> = {
    "Artificial Intelligence": <Cpu size={24} color="#6366F1" />,
    "Web Development": <Globe size={24} color="#06B6D4" />,
    "FinTech": <Coins size={24} color="#F59E0B" />,
    "Healthcare": <HeartPulse size={24} color="#F43F5E" />,
    "Sustainability": <Leaf size={24} color="#10B981" />,
  };

  return (
    <div style={{ background: "var(--bg-main)", minHeight: "100vh", color: "var(--text-primary)" }}>
      {/* Top Navbar */}
      <nav
        style={{
          height: "70px",
          background: "rgba(17, 24, 39, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2.5rem",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              color: "#FFFFFF",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)",
            }}
          >
            <Code2 size={20} />
          </div>
          <span style={{ fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
            HACK<span style={{ color: "var(--primary)" }}>FORGE</span>
          </span>
          <span className="badge badge-primary" style={{ marginLeft: "0.5rem" }}>
            DogFood 2026
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <a href="#problem" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
            Solution
          </a>
          <a href="#tracks" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
            Tracks
          </a>
          <a href="#judging" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
            Judging Engine
          </a>
          <a href="#timeline" style={{ color: "var(--text-secondary)", textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>
            Timeline
          </a>

          {user ? (
            <Link
              to={user.role === "ADMIN" ? "/admin" : user.role === "JUDGE" ? "/judge" : "/dashboard"}
              className="btn btn-primary btn-sm"
            >
              Enter Portal ({user.role}) <ArrowRight size={14} />
            </Link>
          ) : (
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <button onClick={() => handleGoogleLogin()} className="btn btn-primary btn-sm">
                <LogIn size={14} /> Continue with Google
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          position: "relative",
          padding: "6rem 2rem 5rem",
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.35rem 1rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(99, 102, 241, 0.12)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            color: "#A5B4FC",
            fontSize: "0.85rem",
            fontWeight: 600,
            marginBottom: "1.5rem",
          }}
        >
          <Sparkles size={14} /> Centralized Hackathon Management & Automated Judging Platform
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: "1.5rem",
            letterSpacing: "-0.03em",
          }}
        >
          One System to Run the Entire{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #818CF8 0%, #C084FC 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Hackathon Lifecycle
          </span>
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            color: "var(--text-secondary)",
            maxWidth: "780px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.6,
          }}
        >
          Replace chaotic spreadsheets, manual judging sheets, and delayed results. HackForge powers
          registration, team formation, track locking, project development, AI-assisted judging,
          and instant statistical score normalization.
        </p>

        {/* Call to Actions & Demo Switchers */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
          <button
            onClick={() => handleGoogleLogin("PARTICIPANT")}
            className="btn btn-primary btn-lg"
            style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}
          >
            <Users size={18} /> Participant Portal Demo
          </button>
          <button
            onClick={() => handleGoogleLogin("JUDGE")}
            className="btn btn-secondary btn-lg"
            style={{ padding: "0.875rem 2rem", fontSize: "1rem" }}
          >
            <Award size={18} /> Judge Workspace Demo
          </button>
          <button
            onClick={() => handleGoogleLogin("ADMIN")}
            className="btn btn-secondary btn-lg"
            style={{
              padding: "0.875rem 2rem",
              fontSize: "1rem",
              borderColor: "rgba(99, 102, 241, 0.4)",
            }}
          >
            <Shield size={18} color="var(--primary)" /> Organizer Console Demo
          </button>
        </div>

        {/* Live Event Stats Counter Bar */}
        <div
          className="card"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1.5rem",
            padding: "1.75rem",
            background: "rgba(30, 41, 59, 0.6)",
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>120</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Verified Participants
            </div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-cyan)" }}>35</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Formed Teams
            </div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-emerald)" }}>28</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Live Submissions
            </div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-amber)" }}>$25,000</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Prize Pool
            </div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-rose)" }}>5 Tracks</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              Engineering Domains
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Flow */}
      <section id="problem" style={{ padding: "5rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="badge badge-primary" style={{ marginBottom: "0.5rem" }}>
            The HackForge Solution
          </span>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            End-to-End Lifecycle Without Tool Fragmentation
          </h2>
          <p style={{ maxWidth: "680px", margin: "0 auto", color: "var(--text-secondary)" }}>
            Traditional hackathons stumble on disconnected forms, lost code repositories, and subjective score sheets. HackForge links every phase into an unbroken automated pipeline.
          </p>
        </div>

        {/* 10-step lifecycle diagram */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "1rem",
            marginBottom: "3rem",
          }}
        >
          {[
            { step: "01", title: "Registration", desc: "Google auth & auto role assignment" },
            { step: "02", title: "Team Formation", desc: "Squad invites & lone hacker matching" },
            { step: "03", title: "Track Selection", desc: "Locking engineering categories" },
            { step: "04", title: "Project Dev", desc: "Readiness checklist & repo sync" },
            { step: "05", title: "Submission", desc: "Demos, videos, architecture & tags" },
            { step: "06", title: "Judging Engine", desc: "Auto workload balancing & AI summary" },
            { step: "07", title: "Evaluation", desc: "5-factor weighted rubric & feedback" },
            { step: "08", title: "Scoring Normalization", desc: "Multi-judge variance mitigation" },
            { step: "09", title: "Leaderboard", desc: "Category winners & tie-break engine" },
            { step: "10", title: "Results Reveal", desc: "Instant publication & winner awards" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                padding: "1.25rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                position: "relative",
              }}
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--primary)",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                PHASE {item.step}
              </div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                {item.title}
              </h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tracks Showcase */}
      <section id="tracks" style={{ padding: "5rem 2rem", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span className="badge badge-cyan" style={{ marginBottom: "0.5rem" }}>
              5 Competition Tracks
            </span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
              Build the Next Generation of Software
            </h2>
            <p style={{ maxWidth: "650px", margin: "0 auto", color: "var(--text-secondary)" }}>
              Specialized evaluation tracks tailored to high-impact technical disciplines.
            </p>
          </div>

          <div className="grid-3">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "1.75rem",
                }}
              >
                <div>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.25rem",
                    }}
                  >
                    {trackIcons[track.name] || <Layers size={24} color="var(--primary)" />}
                  </div>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                    {track.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      marginBottom: "1.25rem",
                    }}
                  >
                    {track.description}
                  </p>
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
                  <span style={{ fontSize: "0.8rem", color: "var(--accent-amber)", fontWeight: 600 }}>
                    $5,000 Grand Prize
                  </span>
                  <button
                    onClick={() => handleGoogleLogin("PARTICIPANT")}
                    className="btn btn-secondary btn-sm"
                  >
                    Select Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Judging Engine & Rubric Breakdown */}
      <section id="judging" style={{ padding: "5rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span className="badge badge-success" style={{ marginBottom: "0.5rem" }}>
            Transparent Judging Engine
          </span>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
            The 5-Factor Weighted Rubric (100 Maximum Points)
          </h2>
          <p style={{ maxWidth: "680px", margin: "0 auto", color: "var(--text-secondary)" }}>
            No black-box decisions. Every project is scored against standardized criteria with live weighted totals and multi-judge statistical normalization.
          </p>
        </div>

        <div className="grid-sidebar">
          {/* Criteria Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {criteria.map((c) => (
              <div
                key={c.id}
                className="card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{c.name}</h4>
                    <span className="badge badge-primary">{Math.round(c.weight * 100)}% Weight</span>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{c.description}</p>
                </div>
                <div style={{ textAlign: "right", minWidth: "90px" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)" }}>
                    {c.maxScore}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Max Points</div>
                </div>
              </div>
            ))}
          </div>

          {/* Automated Engine Highlights */}
          <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              <Scale size={20} color="var(--primary)" /> Algorithmic Guarantees
            </h3>

            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                Auto-Balanced Workload
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Projects are distributed evenly across the 3 panel judges (Dr. Marcus Brody, Dr. Sarah Chen, Alex Rivera) ensuring minimum 2 independent evaluations per project.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                Score Variance Flags
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                The engine flags any project where two judges differ by more than 15 points, prompting an organizer review before publishing.
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                Tie-Breaker Hierarchy
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Ties are mathematically resolved by prioritizing Technical Implementation (25%) followed by Innovation (25%).
              </p>
            </div>

            <div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                AI-Assisted Summaries
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Judges receive automated summaries of repository activity and key technical features, speeding up comprehensive reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 72-Hour Timeline */}
      <section id="timeline" style={{ padding: "5rem 2rem", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <span className="badge badge-warning" style={{ marginBottom: "0.5rem" }}>
              72-Hour Sprint
            </span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 800, marginBottom: "0.75rem" }}>
              Official Hackathon Timeline
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Mark your calendar for DogFood Hackathon 2026.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {[
              {
                time: "Day 1 • 09:00 AM",
                title: "Opening Ceremony & Team Formation",
                desc: "Keynote, challenge track reveal, squad recruitment, and initial GitHub repository creation.",
                status: "Done",
              },
              {
                time: "Day 2 • 12:00 PM",
                title: "Mid-Sprint Checkpoint & Track Locking",
                desc: "Finalize track selection. Draft submission opened with mentor office hours.",
                status: "Done",
              },
              {
                time: "Day 3 • 06:00 PM",
                title: "Submission Deadline",
                desc: "Final code push, public demo links, video walkthroughs, and architecture tags locked.",
                status: "Current Phase",
              },
              {
                time: "Day 4 • 10:00 AM",
                title: "Automated Judging & Normalization Engine",
                desc: "Multi-judge evaluation runs across all 28 projects with rubric weighting and variance checks.",
                status: "Upcoming",
              },
              {
                time: "Day 4 • 04:00 PM",
                title: "Results Publication & Award Ceremony",
                desc: "Results published live to the global leaderboard. $25,000 in grand prizes awarded.",
                status: "Upcoming",
              },
            ].map((phase, idx) => (
              <div
                key={idx}
                className="card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                  padding: "1.5rem",
                  borderLeft:
                    phase.status === "Current Phase"
                      ? "4px solid var(--primary)"
                      : "1px solid var(--border-color)",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 700 }}>
                    {phase.time}
                  </div>
                  <h4 style={{ fontSize: "1.15rem", fontWeight: 700, margin: "0.25rem 0" }}>
                    {phase.title}
                  </h4>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{phase.desc}</p>
                </div>
                <div>
                  <span
                    className={`badge ${
                      phase.status === "Current Phase"
                        ? "badge-warning"
                        : phase.status === "Done"
                        ? "badge-success"
                        : "badge-neutral"
                    }`}
                  >
                    {phase.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={{ padding: "5rem 2rem", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Everything you need to know about HackForge and DogFood Hackathon 2026.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="card"
              style={{
                cursor: "pointer",
                padding: "1.25rem 1.5rem",
              }}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 600 }}>{faq.q}</h4>
                {openFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
              {openFaq === index && (
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    marginTop: "0.75rem",
                    lineHeight: 1.6,
                  }}
                >
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <footer
        style={{
          borderTop: "1px solid var(--border-color)",
          padding: "4rem 2rem 3rem",
          background: "var(--bg-secondary)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "1rem" }}>
            Ready to Experience HackForge?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
            Test the complete end-to-end platform with pre-seeded data for 120 participants, 35 teams, 28 submissions, and automated multi-judge scoring.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "3rem" }}>
            <button onClick={() => handleGoogleLogin("ADMIN")} className="btn btn-primary">
              <Shield size={16} /> Enter as Organizer (Admin)
            </button>
            <button onClick={() => handleGoogleLogin("JUDGE")} className="btn btn-secondary">
              <Award size={16} /> Enter as Judge
            </button>
            <button onClick={() => handleGoogleLogin("PARTICIPANT")} className="btn btn-secondary">
              <Users size={16} /> Enter as Participant
            </button>
          </div>

          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "2rem" }}>
            HackForge • DogFood Hackathon 2026 Production Platform • Built with React, Vite, TypeScript & Tailwind-free Vanilla CSS
          </div>
        </div>
      </footer>
    </div>
  );
};
