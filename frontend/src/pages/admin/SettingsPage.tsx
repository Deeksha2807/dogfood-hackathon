import React, { useState } from "react";
import { useHackathon } from "../../context/HackathonContext";
import { useToast } from "../../context/ToastContext";
import {
  Sliders,
  Calendar,
  Scale,
  Shield,
  Palette,
  Clock,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
  Zap,
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const {
    eventConfig,
    updateEventConfig,
    extendDeadline,
    criteria,
    updateCriterion,
    notifications,
  } = useHackathon();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<
    "EVENT" | "CRITERIA" | "RBAC" | "BRANDING" | "AUDIT"
  >("EVENT");

  // Event Config Form State
  const [eventForm, setEventForm] = useState({
    name: eventConfig.name,
    tagline: eventConfig.tagline,
    description: eventConfig.description,
    dates: eventConfig.dates,
    submissionDeadline: eventConfig.submissionDeadline,
    judgingDeadline: eventConfig.judgingDeadline,
    phase: eventConfig.phase,
    maxTeamSize: eventConfig.maxTeamSize,
  });

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    updateEventConfig(eventForm);
    success("Hackathon event configuration saved successfully.");
  };

  const handleExtend = (hours: number) => {
    extendDeadline(hours);
    success(`Extended submission deadline by ${hours} hours.`);
  };

  // Criteria & Weights calculation
  const totalWeight = Math.round(
    criteria.reduce((acc, c) => acc + c.weight * 100, 0)
  );
  const totalMaxScore = criteria.reduce((acc, c) => acc + c.maxScore, 0);

  const handleCriterionChange = (
    id: string,
    field: "name" | "description" | "weight" | "maxScore",
    val: any
  ) => {
    updateCriterion(id, { [field]: val });
  };

  // Sample Audit Log entries
  const auditLogs = [
    {
      id: "log-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
      actor: "Dr. Marcus Brody (Judge)",
      action: "Submitted evaluation for SynapseOS (87/100)",
      type: "scoring",
    },
    {
      id: "log-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toLocaleTimeString(),
      actor: "Elena Vance (Admin)",
      action: "Executed auto-balance algorithm across 3 judges (28 submissions)",
      type: "admin",
    },
    {
      id: "log-3",
      timestamp: new Date(Date.now() - 1000 * 60 * 65).toLocaleTimeString(),
      actor: "Dr. Sarah Chen (Judge)",
      action: "Recused from evaluating 'AuraHealth' due to academic advisory conflict",
      type: "recusal",
    },
    {
      id: "log-4",
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleTimeString(),
      actor: "Alice Johnson (Participant)",
      action: "Finalized project submission for Team Alpha (track-ai)",
      type: "submission",
    },
    {
      id: "log-5",
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toLocaleTimeString(),
      actor: "System Engine",
      action: "Validated all 28 repositories for active commits and README files",
      type: "system",
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Sliders size={28} color="var(--primary)" /> Administrative Settings
          </h1>
          <p>
            Configure competition phases, criteria weights, platform branding, RBAC security, and view audit history
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "2rem",
          overflowX: "auto",
        }}
      >
        {[
          { id: "EVENT", label: "Event Management", icon: <Calendar size={16} /> },
          { id: "CRITERIA", label: "Judging Criteria & Weights", icon: <Scale size={16} /> },
          { id: "RBAC", label: "Roles & Permissions", icon: <Shield size={16} /> },
          { id: "BRANDING", label: "Platform Branding", icon: <Palette size={16} /> },
          { id: "AUDIT", label: "System Audit Log", icon: <Clock size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.25rem",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "2px solid transparent",
              color: activeTab === tab.id ? "var(--primary)" : "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: EVENT MANAGEMENT */}
      {activeTab === "EVENT" && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={18} color="var(--primary)" /> Hackathon Lifecycle & Deadlines
            </h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={() => handleExtend(2)} className="btn btn-secondary btn-sm">
                +2 Hours Deadline
              </button>
              <button onClick={() => handleExtend(24)} className="btn btn-secondary btn-sm">
                +24 Hours Deadline
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveEvent} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Event Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Tagline</label>
                <input
                  type="text"
                  className="form-input"
                  value={eventForm.tagline}
                  onChange={(e) => setEventForm({ ...eventForm, tagline: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              />
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Current Hackathon Phase</label>
                <select
                  className="form-select"
                  value={eventForm.phase}
                  onChange={(e) => setEventForm({ ...eventForm, phase: e.target.value as any })}
                >
                  <option value="REGISTRATION">Registration</option>
                  <option value="TEAM_FORMATION">Team Formation</option>
                  <option value="HACKING">Hacking & Development</option>
                  <option value="JUDGING">Judging & Evaluation</option>
                  <option value="RESULTS">Results Published</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Submission Deadline</label>
                <input
                  type="text"
                  className="form-input"
                  value={eventForm.submissionDeadline}
                  onChange={(e) => setEventForm({ ...eventForm, submissionDeadline: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Team Size</label>
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  max={10}
                  value={eventForm.maxTeamSize}
                  onChange={(e) => setEventForm({ ...eventForm, maxTeamSize: Number(e.target.value) })}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> Save Event Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: CRITERIA & WEIGHTS */}
      {activeTab === "CRITERIA" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Status banner */}
          <div
            style={{
              padding: "1rem 1.25rem",
              borderRadius: "var(--radius-md)",
              background:
                totalWeight === 100
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(245, 158, 11, 0.15)",
              border:
                totalWeight === 100
                  ? "1px solid rgba(16, 185, 129, 0.3)"
                  : "1px solid rgba(245, 158, 11, 0.3)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {totalWeight === 100 ? (
                <CheckCircle2 size={24} color="var(--accent-emerald)" />
              ) : (
                <AlertTriangle size={24} color="var(--accent-amber)" />
              )}
              <div>
                <strong style={{ color: "var(--text-primary)" }}>
                  Total Weights: {totalWeight}% • Maximum Score: {totalMaxScore} Points
                </strong>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {totalWeight === 100
                    ? "Mathematical weights correctly sum to 100%. Automatic scoring calculations are balanced."
                    : "Warning: Weights must total 100% for normalized scoring consistency."}
                </div>
              </div>
            </div>
          </div>

          {/* Criteria Editor Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Criterion Name</th>
                  <th>Description</th>
                  <th style={{ width: "140px" }}>Weight (%)</th>
                  <th style={{ width: "120px" }}>Max Score</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={c.name}
                        onChange={(e) => handleCriterionChange(c.id, "name", e.target.value)}
                        style={{ fontWeight: 600 }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={c.description}
                        onChange={(e) => handleCriterionChange(c.id, "description", e.target.value)}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <input
                          type="number"
                          className="form-input"
                          min={0}
                          max={100}
                          value={Math.round(c.weight * 100)}
                          onChange={(e) =>
                            handleCriterionChange(c.id, "weight", Number(e.target.value) / 100)
                          }
                        />
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>%</span>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        min={1}
                        max={100}
                        value={c.maxScore}
                        onChange={(e) =>
                          handleCriterionChange(c.id, "maxScore", Number(e.target.value))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ROLES & PERMISSIONS */}
      {activeTab === "RBAC" && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Shield size={18} color="var(--primary)" /> Role-Based Access Control (RBAC)
            </h3>
            <span className="badge badge-primary">Database-Decided</span>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Role permissions are determined strictly by verified Google email authentication in the database and cannot be chosen by users.
          </p>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Platform Capability</th>
                  <th style={{ textAlign: "center" }}>PARTICIPANT</th>
                  <th style={{ textAlign: "center" }}>JUDGE</th>
                  <th style={{ textAlign: "center" }}>ADMIN / ORGANIZER</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cap: "Create & Manage Own Team", p: true, j: false, a: true },
                  { cap: "Select & Lock Competition Track", p: true, j: false, a: true },
                  { cap: "Draft & Submit Project", p: true, j: false, a: true },
                  { cap: "View Other Teams' Unsubmitted Code", p: false, j: false, a: true },
                  { cap: "Access Assigned Project Evaluations", p: false, j: true, a: true },
                  { cap: "View AI Project Summaries", p: false, j: true, a: true },
                  { cap: "Submit Weighted Scores & Feedback", p: false, j: true, a: true },
                  { cap: "Recuse from Evaluation (Conflict of Interest)", p: false, j: true, a: true },
                  { cap: "Auto-Balance Judge Assignments", p: false, j: false, a: true },
                  { cap: "Disqualify Ineligible Submissions", p: false, j: false, a: true },
                  { cap: "Publish Official Global Results", p: false, j: false, a: true },
                  { cap: "Export Participant CSV & Audit Logs", p: false, j: false, a: true },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{row.cap}</td>
                    <td style={{ textAlign: "center" }}>
                      {row.p ? (
                        <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ margin: "0 auto" }} />
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {row.j ? (
                        <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ margin: "0 auto" }} />
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {row.a ? (
                        <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ margin: "0 auto" }} />
                      ) : (
                        <span style={{ color: "var(--text-muted)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BRANDING */}
      {activeTab === "BRANDING" && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Palette size={18} color="var(--primary)" /> Platform Visual Identity
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Platform Branding Name</label>
                <input type="text" className="form-input" defaultValue="HackForge" />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Accent Color</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    type="color"
                    defaultValue="#6366f1"
                    style={{
                      width: "48px",
                      height: "38px",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      cursor: "pointer",
                      background: "transparent",
                    }}
                  />
                  <input type="text" className="form-input" defaultValue="#6366f1 (Indigo/Violet)" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Theme Mode Setting</label>
              <div style={{ display: "flex", gap: "1rem" }}>
                <span className="badge badge-primary">Dark-First Enabled</span>
                <span className="badge badge-success">Light Theme Supported</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => success("Platform branding updated successfully.")}
                className="btn btn-primary"
              >
                <Save size={16} /> Save Branding
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOG */}
      {activeTab === "AUDIT" && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} color="var(--primary)" /> Real-Time Platform Audit Log
            </h3>
            <span className="badge badge-success">Live Stream</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {auditLogs.map((log) => (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.875rem 1rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {log.action}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Actor: {log.actor}
                  </div>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
