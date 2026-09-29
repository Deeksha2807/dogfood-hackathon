import React, { useState } from "react";
import { useHackathon } from "../../context/HackathonContext";
import { TeamData } from "../../data/hackathonData";
import { useToast } from "../../context/ToastContext";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Modal } from "../../components/common/Modal";
import {
  Users,
  Search,
  FolderGit2,
  Copy,
  Check,
  UserPlus,
  Trash2,
  Layers,
  Filter,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

export const TeamManagement: React.FC = () => {
  const { teams, participants, assignParticipantToTeam, removeTeam } = useHackathon();
  const { success, error, info } = useToast();

  const [search, setSearch] = useState("");
  const [trackFilter, setTrackFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState("");

  const loneParticipants = participants.filter((p) => !p.teamId);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    success("Invite code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAssignModal = (team: TeamData) => {
    setSelectedTeam(team);
    if (loneParticipants.length > 0) {
      setSelectedParticipantId(loneParticipants[0].id);
    }
    setAssignModalOpen(true);
  };

  const handleExecuteAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !selectedParticipantId) {
      error("Please select a participant to assign.");
      return;
    }
    assignParticipantToTeam(selectedParticipantId, selectedTeam.id);
    const p = participants.find((part) => part.id === selectedParticipantId);
    success(`Assigned ${p?.name || "participant"} to team "${selectedTeam.name}"!`);
    setAssignModalOpen(false);
  };

  const handleRemoveTeam = (team: TeamData) => {
    if (window.confirm(`Are you sure you want to disband "${team.name}"? Team members will become lone participants.`)) {
      removeTeam(team.id);
      info(`Team "${team.name}" disbanded.`);
    }
  };

  const filteredTeams = teams.filter((t) => {
    const q = search.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      t.inviteCode.toLowerCase().includes(q) ||
      (t.projectName && t.projectName.toLowerCase().includes(q)) ||
      t.members.some((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));

    const matchesTrack = trackFilter === "ALL" || t.trackName === trackFilter || t.trackId === trackFilter;

    return matchesSearch && matchesTrack;
  });

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Users size={28} color="var(--primary)" /> Teams & Formation Roster
          </h1>
          <p>
            Monitor formed squads, track selections, submission readiness, and assign lone participants
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-3" style={{ marginBottom: "1.75rem" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(99, 102, 241, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
            }}
          >
            <Layers size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>{teams.length}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Total Active Teams</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(16, 185, 129, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-emerald)",
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>
              {teams.filter((t) => t.members.length >= 3).length}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Complete Squads (3-4 members)</div>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.25rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "rgba(245, 158, 11, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent-amber)",
            }}
          >
            <AlertCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800 }}>{loneParticipants.length}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Lone Hackers Seeking Teams</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 1.25rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 280px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search teams by name, project, invite code, or members..."
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

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="form-select"
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            style={{ minWidth: "180px" }}
          >
            <option value="ALL">All Tracks</option>
            <option value="Artificial Intelligence">Artificial Intelligence</option>
            <option value="Web Development">Web Development</option>
            <option value="FinTech">FinTech</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Sustainability">Sustainability</option>
          </select>
        </div>
      </div>

      {/* Teams Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Team Name</th>
              <th>Track</th>
              <th>Members</th>
              <th>Project Name</th>
              <th>Submission Status</th>
              <th>Invite Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "var(--text-muted)" }}>
                  No matching teams found.
                </td>
              </tr>
            ) : (
              filteredTeams.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Created {new Date(t.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{t.trackName}</span>
                  </td>
                  <td>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span className="badge badge-neutral" style={{ fontSize: "0.75rem" }}>
                          {t.members.length} / 4 Members
                        </span>
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        {t.members.map((m) => m.name).join(", ")}
                      </div>
                    </div>
                  </td>
                  <td>
                    {t.projectName ? (
                      <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                        {t.projectName}
                      </span>
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.85rem" }}>
                        No project declared yet
                      </span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={t.submissionStatus} />
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <code style={{ fontSize: "0.82rem", color: "var(--primary)", fontFamily: "var(--font-mono)" }}>
                        {t.inviteCode}
                      </code>
                      <button
                        className="btn-icon"
                        onClick={() => handleCopyCode(t.inviteCode, t.id)}
                        title="Copy code"
                        style={{ padding: "3px", borderRadius: "4px" }}
                      >
                        {copiedId === t.id ? (
                          <Check size={13} color="var(--accent-emerald)" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenAssignModal(t)}
                        title="Assign lone participant to this team"
                        disabled={t.members.length >= 4}
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                      >
                        <UserPlus size={13} /> Assign
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleRemoveTeam(t)}
                        title="Disband squad"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", color: "var(--accent-rose)" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Lone Participant Modal */}
      {assignModalOpen && selectedTeam && (
        <Modal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          title={`Assign Lone Participant to "${selectedTeam.name}"`}
          maxWidth="500px"
        >
          <form onSubmit={handleExecuteAssign}>
            <div style={{ padding: "0.5rem 0 1rem 0" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Select an unassigned participant to place onto this squad. Current team roster:{" "}
                <strong>{selectedTeam.members.length}/4 members</strong>.
              </p>

              {loneParticipants.length === 0 ? (
                <div style={{ padding: "1rem", borderRadius: "var(--radius-md)", background: "var(--bg-input)", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
                  All registered participants are currently assigned to teams!
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Select Unassigned Hacker:</label>
                  <select
                    className="form-select"
                    value={selectedParticipantId}
                    onChange={(e) => setSelectedParticipantId(e.target.value)}
                    required
                  >
                    {loneParticipants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.email}) — {p.collegeCompany}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setAssignModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loneParticipants.length === 0}
              >
                Confirm Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
