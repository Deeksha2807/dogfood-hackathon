import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useHackathon, CalculatedResultItem } from "../../context/HackathonContext";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/common/Modal";
import {
  BarChart3,
  Calculator,
  Download,
  Eye,
  EyeOff,
  Trophy,
  Sparkles,
  Shield,
  Medal,
  Filter,
  HelpCircle,
  Printer,
  MessageSquare,
  CheckCircle,
  Award,
  Layers,
} from "lucide-react";

export const ResultsDashboard: React.FC = () => {
  const { isOrganizer, isSuperAdmin, isJudge, user: authUser } = useAuth();
  const {
    eventConfig,
    togglePublishResults,
    calculatedResults,
    recalculateResults,
    tracks,
    mySubmission,
  } = useHackathon();
  const { success, info } = useToast();

  const [selectedTrack, setSelectedTrack] = useState<string>("ALL");
  const [tieBreakerModalOpen, setTieBreakerModalOpen] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  const isAdminOrOrganizer = isOrganizer || isSuperAdmin;
  const isResultsPublished = eventConfig.isResultsPublished;

  // Filter results by track
  const filteredResults = calculatedResults.filter((r) => {
    if (selectedTrack === "ALL") return true;
    return r.trackId === selectedTrack || r.trackName === selectedTrack;
  });

  // Top 3 Podium
  const top1 = filteredResults[0];
  const top2 = filteredResults[1];
  const top3 = filteredResults[2];

  // Find user's own project result if participant
  const userProjectResult = calculatedResults.find(
    (r) =>
      r.submissionId === mySubmission?.id ||
      r.projectName.toLowerCase() === mySubmission?.projectName.toLowerCase()
  );

  const handleRecalculate = () => {
    setIsCalculating(true);
    recalculateResults();
    setTimeout(() => {
      setIsCalculating(false);
      success("Mathematical normalization & final scores calculated successfully!");
    }, 400);
  };

  const handleExportCsv = () => {
    const header = "Rank,Project Name,Team,Track,Judges,Innovation (25),Technical (25),Impact (20),UX (15),Presentation (15),Raw Avg,Final Score\n";
    const rows = filteredResults
      .map(
        (r) =>
          `"${r.rank}","${r.projectName}","${r.teamName}","${r.trackName}","${r.judgeCount}","${r.criteriaAverages.innovation.toFixed(1)}","${r.criteriaAverages.technical.toFixed(1)}","${r.criteriaAverages.impact.toFixed(1)}","${r.criteriaAverages.ux.toFixed(1)}","${r.criteriaAverages.presentation.toFixed(1)}","${r.rawAverage.toFixed(1)}","${r.finalScore.toFixed(1)}"`
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hackathon_leaderboard_${selectedTrack.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    success("Leaderboard exported to CSV successfully!");
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <h1>
              <BarChart3 size={28} color="var(--primary)" /> Leaderboard & Results
            </h1>
          </div>
          <p>
            Official hackathon rankings, 5-criteria score breakdown, and cross-judge normalized scores
          </p>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={() => setTieBreakerModalOpen(true)}>
            <HelpCircle size={15} /> Tie-Breaker Rule
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleExportCsv}>
            <Download size={15} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handlePrintPdf}>
            <Printer size={15} /> Export PDF
          </button>

          {isAdminOrOrganizer && (
            <>
              <button
                className="btn btn-secondary"
                onClick={togglePublishResults}
              >
                {isResultsPublished ? (
                  <>
                    <EyeOff size={16} /> Unpublish Results
                  </>
                ) : (
                  <>
                    <Eye size={16} /> Publish Results
                  </>
                )}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRecalculate}
                disabled={isCalculating}
              >
                <Calculator size={16} /> {isCalculating ? "Calculating..." : "Recalculate Scores"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Visibility Status Alert */}
      <div
        style={{
          background: isResultsPublished ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
          border: `1px solid ${isResultsPublished ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
          borderRadius: "var(--radius-md)",
          padding: "1rem 1.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Shield size={20} color={isResultsPublished ? "var(--accent-emerald)" : "var(--accent-amber)"} />
          <div>
            <div style={{ fontWeight: 600, color: isResultsPublished ? "#6EE7B7" : "#FCD34D", fontSize: "0.95rem" }}>
              {isResultsPublished ? "Public Visibility: LIVE & PUBLISHED" : "Public Visibility: LOCKED (Judging in Progress)"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {isResultsPublished
                ? "All participants and judges can now view the official rankings, score breakdowns, and awards."
                : "Results are restricted to organizers until final multi-judge scoring concludes."}
            </div>
          </div>
        </div>
        {isAdminOrOrganizer && (
          <span className="badge badge-primary">Admin Control Active</span>
        )}
      </div>

      {/* If Not Published & Participant */}
      {!isResultsPublished && !isAdminOrOrganizer && !isJudge ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px dashed var(--border-color)",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(245, 158, 11, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-amber)",
              margin: "0 auto 1.5rem auto",
            }}
          >
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Official Judging In Progress
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "580px", margin: "0 auto 1.5rem auto", lineHeight: 1.6 }}>
            The evaluation panel is currently scoring submissions across all 5 criteria: Innovation (25), Technical Implementation (25), Impact (20), UX (15), and Presentation (15).
            The official leaderboard and judge feedback will be published here once evaluation closes.
          </p>
          <span className="badge badge-warning" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
            🔒 Results Locked by Organizer
          </span>
        </div>
      ) : (
        <>
          {/* Participant's Own Result Banner if applicable */}
          {userProjectResult && (
            <div
              className="card"
              style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(30, 41, 59, 0.95) 100%)",
                borderColor: "rgba(99, 102, 241, 0.4)",
                padding: "1.75rem",
                marginBottom: "2rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1.5rem", marginBottom: "1.25rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                    <span className="badge badge-primary">Your Project Standing</span>
                    <span className="badge badge-success">Rank #{userProjectResult.rank} Overall</span>
                  </div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800 }}>{userProjectResult.projectName}</h2>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                    Team {userProjectResult.teamName} • {userProjectResult.trackName}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "2.25rem", fontWeight: 800, color: "var(--primary)" }}>
                    {userProjectResult.finalScore.toFixed(1)}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>/ 100 Normalized Score</div>
                </div>
              </div>

              {/* 5-Criteria Breakdown Bar Chart */}
              <div style={{ background: "var(--bg-input)", padding: "1.25rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.75rem", color: "var(--text-secondary)" }}>
                  Rubric Criteria Score Breakdown
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Innovation (25)</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {userProjectResult.criteriaAverages.innovation.toFixed(1)} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/25</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Technical (25)</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {userProjectResult.criteriaAverages.technical.toFixed(1)} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/25</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Impact (20)</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {userProjectResult.criteriaAverages.impact.toFixed(1)} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/20</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>UX (15)</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {userProjectResult.criteriaAverages.ux.toFixed(1)} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/15</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Presentation (15)</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {userProjectResult.criteriaAverages.presentation.toFixed(1)} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/15</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Judge Feedback Comments */}
              {userProjectResult.feedbacks && userProjectResult.feedbacks.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <MessageSquare size={15} color="var(--primary)" /> Judge Feedback & Comments
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {userProjectResult.feedbacks.map((fb, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "var(--bg-input)",
                          padding: "0.75rem 1rem",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.85rem",
                          borderLeft: "3px solid var(--primary)",
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{fb.judgeName}: </span>
                        <span style={{ color: "var(--text-secondary)" }}>"{fb.comment}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top 3 Podium Cards */}
          {filteredResults.length >= 3 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
              {/* 1st Place Champion */}
              {top1 && (
                <div
                  className="card"
                  style={{
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)",
                    borderColor: "rgba(245, 158, 11, 0.4)",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Trophy size={20} color="var(--accent-amber)" />
                    <span className="badge badge-warning">1st Place Champion</span>
                  </div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                    {top1.projectName}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    by {top1.teamName} • {top1.trackName}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-amber)" }}>
                      {top1.finalScore.toFixed(1)}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/ 100 normalized</span>
                  </div>
                  <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--accent-amber)", fontWeight: 600 }}>
                    {top1.prizeAward || "$8,000 Grand Prize"}
                  </div>
                </div>
              )}

              {/* 2nd Place */}
              {top2 && (
                <div
                  className="card"
                  style={{
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)",
                    borderColor: "rgba(99, 102, 241, 0.4)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Medal size={20} color="var(--primary)" />
                    <span className="badge badge-primary">2nd Place Finalist</span>
                  </div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                    {top2.projectName}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    by {top2.teamName} • {top2.trackName}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)" }}>
                      {top2.finalScore.toFixed(1)}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/ 100 normalized</span>
                  </div>
                  <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600 }}>
                    {top2.prizeAward || "$4,500 Runner-Up"}
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3 && (
                <div
                  className="card"
                  style={{
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(30, 41, 59, 0.9) 100%)",
                    borderColor: "rgba(16, 185, 129, 0.35)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Award size={20} color="var(--accent-emerald)" />
                    <span className="badge badge-success">3rd Place Honoree</span>
                  </div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                    {top3.projectName}
                  </h3>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    by {top3.teamName} • {top3.trackName}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-emerald)" }}>
                      {top3.finalScore.toFixed(1)}
                    </span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/ 100 normalized</span>
                  </div>
                  <div style={{ marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--accent-emerald)", fontWeight: 600 }}>
                    {top3.prizeAward || "$2,500 Excellence Award"}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Track Filter Bar */}
          <div
            className="card"
            style={{
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={16} color="var(--primary)" />
              <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Filter Leaderboard by Track:</span>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button
                className={`btn btn-sm ${selectedTrack === "ALL" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setSelectedTrack("ALL")}
              >
                All Tracks ({calculatedResults.length})
              </button>
              {tracks.map((t) => (
                <button
                  key={t.id}
                  className={`btn btn-sm ${selectedTrack === t.id || selectedTrack === t.name ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setSelectedTrack(t.id)}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Official Leaderboard Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Rank</th>
                  <th>Project Name</th>
                  <th>Track</th>
                  <th>Judges</th>
                  <th title="Innovation & Originality (Max 25 pts)">Innovation (25)</th>
                  <th title="Technical Implementation (Max 25 pts)">Technical (25)</th>
                  <th title="Real-World Impact (Max 20 pts)">Impact (20)</th>
                  <th title="User Experience (Max 15 pts)">UX (15)</th>
                  <th title="Presentation & Pitch (Max 15 pts)">Pres (15)</th>
                  <th>Raw Avg</th>
                  <th>Normalized Score</th>
                  <th>Award Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((r, idx) => {
                  const isUserProject = r.submissionId === mySubmission?.id;
                  return (
                    <tr
                      key={r.submissionId || idx}
                      style={{
                        background: isUserProject ? "rgba(99, 102, 241, 0.08)" : undefined,
                      }}
                    >
                      <td>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                            background:
                              idx === 0
                                ? "rgba(245, 158, 11, 0.2)"
                                : idx === 1
                                ? "rgba(99, 102, 241, 0.2)"
                                : idx === 2
                                ? "rgba(16, 185, 129, 0.2)"
                                : "var(--bg-input)",
                            color:
                              idx === 0
                                ? "var(--accent-amber)"
                                : idx === 1
                                ? "var(--primary)"
                                : idx === 2
                                ? "var(--accent-emerald)"
                                : "var(--text-primary)",
                            border: "1px solid var(--border-color)",
                          }}
                        >
                          #{r.rank}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {r.projectName}
                          {isUserProject && <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>You</span>}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          by {r.teamName}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{r.trackName}</span>
                      </td>
                      <td>
                        <span className="badge badge-neutral">{r.judgeCount} Judges</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>
                          {r.criteriaAverages.innovation.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>
                          {r.criteriaAverages.technical.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>
                          {r.criteriaAverages.impact.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>
                          {r.criteriaAverages.ux.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>
                          {r.criteriaAverages.presentation.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                          {r.rawAverage.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: "var(--accent-emerald)",
                          }}
                        >
                          {r.finalScore.toFixed(1)}
                        </span>
                      </td>
                      <td>
                        {idx === 0 ? (
                          <span className="badge badge-warning">🏆 1st Champion</span>
                        ) : idx === 1 ? (
                          <span className="badge badge-primary">🥈 2nd Finalist</span>
                        ) : idx === 2 ? (
                          <span className="badge badge-success">🥉 3rd Honoree</span>
                        ) : (
                          <span className="badge badge-neutral">Verified</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tie-Breaker Modal */}
      <Modal
        isOpen={tieBreakerModalOpen}
        onClose={() => setTieBreakerModalOpen(false)}
        title="Official HackForge Tie-Breaker Protocol"
      >
        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          <p style={{ marginBottom: "1rem" }}>
            In the event that two or more projects earn an identical normalized final score, HackForge enforces the following deterministic tie-breaking hierarchy:
          </p>

          <ol style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <li>
              <strong>1. Technical Implementation Score:</strong> The project with the higher normalized score in Technical Execution is awarded the higher rank.
            </li>
            <li>
              <strong>2. Innovation & Originality Score:</strong> If still tied, the project with the higher Innovation score prevails.
            </li>
            <li>
              <strong>3. Real-World Impact Score:</strong> If still tied, the project with the higher Impact score wins.
            </li>
            <li>
              <strong>4. User Experience & Presentation:</strong> Final fallback to UX score followed by Presentation pitch.
            </li>
          </ol>

          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            This rule guarantees consistency across all judging pools without arbitrary human intervention.
          </p>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
            <button className="btn btn-primary" onClick={() => setTieBreakerModalOpen(false)}>
              Understood
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
