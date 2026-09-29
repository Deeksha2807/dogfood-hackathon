import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useHackathon } from "../../context/HackathonContext";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/common/Modal";
import {
  Users,
  UserPlus,
  Copy,
  Check,
  Crown,
  Mail,
  Shield,
  PlusCircle,
  LogIn,
  LogOut,
  Sparkles,
  Compass,
  FolderGit2,
} from "lucide-react";

export const MyTeam: React.FC = () => {
  const { user } = useAuth();
  const { myTeam, tracks, createTeam, joinTeamWithCode, leaveCurrentTeam, mySubmission } = useHackathon();
  const { success, error, info } = useToast();

  const [copied, setCopied] = useState<boolean>(false);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [joinModalOpen, setJoinModalOpen] = useState<boolean>(false);
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState<boolean>(false);

  // Form states
  const [newTeamName, setNewTeamName] = useState<string>("");
  const [newTrackId, setNewTrackId] = useState<string>(tracks[0]?.id || "track-1");
  const [inviteCodeInput, setInviteCodeInput] = useState<string>("");
  const [inviteEmail, setInviteEmail] = useState<string>("");

  const handleCopyCode = () => {
    if (myTeam?.inviteCode) {
      navigator.clipboard.writeText(myTeam.inviteCode);
      setCopied(true);
      success("Invite code copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      error("Please enter a valid team name.");
      return;
    }

    try {
      const created = createTeam(newTeamName.trim(), newTrackId);
      success(`Team "${created.name}" created successfully!`);
      setCreateModalOpen(false);
      setNewTeamName("");
    } catch (err: any) {
      error(err.message || "Failed to create team.");
    }
  };

  const handleJoinTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) {
      error("Please enter an invite code.");
      return;
    }

    const joined = joinTeamWithCode(inviteCodeInput.trim());
    if (joined) {
      success("Successfully joined the team!");
      setJoinModalOpen(false);
      setInviteCodeInput("");
    } else {
      error("Invalid invite code or team is at maximum capacity.");
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !myTeam) {
      error("Please enter a valid email address.");
      return;
    }

    success(`Invitation with access code ${myTeam.inviteCode} sent to ${inviteEmail.trim()}!`);
    setInviteModalOpen(false);
    setInviteEmail("");
  };

  const handleConfirmLeave = () => {
    leaveCurrentTeam();
    success("You have left the team.");
    setLeaveModalOpen(false);
  };

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title">
          <h1>
            <Users size={28} color="var(--primary)" /> My Team Workspace
          </h1>
          <p>Form squads, share invite codes, and manage your hackathon team roster</p>
        </div>

        <div className="page-actions">
          {!myTeam ? (
            <>
              <button className="btn btn-secondary" onClick={() => setJoinModalOpen(true)}>
                <LogIn size={16} /> Join with Code
              </button>
              <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
                <PlusCircle size={16} /> Create Team
              </button>
            </>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn btn-secondary" onClick={() => setLeaveModalOpen(true)}>
                <LogOut size={16} /> Leave Team
              </button>
              <button className="btn btn-primary" onClick={() => setInviteModalOpen(true)}>
                <UserPlus size={16} /> Invite Member
              </button>
            </div>
          )}
        </div>
      </div>

      {myTeam ? (
        <div className="grid-sidebar">
          {/* Main Team Card */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: "0.4rem" }}>
                    Track: {myTeam.trackName}
                  </span>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700 }}>{myTeam.name}</h2>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Roster Capacity</span>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {myTeam.members?.length || 1} / 4 Members
                  </div>
                </div>
              </div>

              {/* Team Members List */}
              <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--text-secondary)" }}>
                Active Members
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {myTeam.members?.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.875rem 1rem",
                      background: "var(--bg-input)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background:
                            member.role === "LEADER"
                              ? "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                              : "var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#FFFFFF",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {member.name ? member.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "var(--text-primary)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {member.name}
                          {member.email === user?.email && (
                            <span style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 500 }}>
                              (You)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          {member.email} • {member.collegeCompany || "Participant"}
                        </div>
                      </div>
                    </div>

                    <div>
                      {member.role === "LEADER" ? (
                        <span className="badge badge-warning" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Crown size={12} /> Team Lead
                        </span>
                      ) : (
                        <span className="badge badge-neutral">Member</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connected Project Card */}
            {mySubmission && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <FolderGit2 size={18} color="var(--primary)" /> Team Project Submission
                  </h3>
                  <Link to="/project" className="btn btn-secondary btn-sm">
                    View Submission →
                  </Link>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>{mySubmission.projectName}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{mySubmission.tagline}</div>
                  </div>
                  <span className="badge badge-success">{mySubmission.status}</span>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info & Invite Code */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Invite Code Box */}
            <div className="card" style={{ borderColor: "rgba(99, 102, 241, 0.3)" }}>
              <div className="card-header">
                <h3 className="card-title">
                  <UserPlus size={18} color="var(--primary)" /> Squad Invite Code
                </h3>
              </div>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Share this unique invite code with teammates so they can join your team workspace.
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.75rem 1rem",
                  marginBottom: "1rem",
                }}
              >
                <code
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {myTeam.inviteCode}
                </code>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopyCode}
                  title="Copy code"
                >
                  {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={() => setInviteModalOpen(true)}
              >
                <Mail size={16} /> Send Email Invite
              </button>
            </div>

            {/* Team Rules Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Team Rules</h3>
              </div>
              <ul style={{ paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <li>Maximum 4 members per hackathon squad</li>
                <li>All team members share the same challenge track</li>
                <li>Any member can edit draft submissions</li>
                <li>Team lead can finalize project submission</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            maxWidth: "600px",
            margin: "3rem auto",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "rgba(99, 102, 241, 0.15)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
              marginBottom: "1.5rem",
            }}
          >
            <Users size={32} />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            You Are Not on a Team Yet
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "2rem" }}>
            Collaborate with up to 4 hackers or form your own team to build and submit your project for judging.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn btn-secondary btn-lg" onClick={() => setJoinModalOpen(true)}>
              <LogIn size={18} /> Join Team with Code
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => setCreateModalOpen(true)}>
              <PlusCircle size={18} /> Create New Team
            </button>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create a New Hackathon Team"
      >
        <form onSubmit={handleCreateTeamSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-team-name">
              Team Name <span className="required">*</span>
            </label>
            <input
              id="new-team-name"
              type="text"
              className="form-input"
              placeholder="e.g. NeuralVoyagers"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="new-team-track">
              Challenge Track <span className="required">*</span>
            </label>
            <select
              id="new-team-track"
              className="form-select"
              value={newTrackId}
              onChange={(e) => setNewTrackId(e.target.value)}
              required
            >
              {tracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Team
            </button>
          </div>
        </form>
      </Modal>

      {/* Join Team Modal */}
      <Modal
        isOpen={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        title="Join Team with Invite Code"
      >
        <form onSubmit={handleJoinTeamSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="invite-code">
              Invite Code <span className="required">*</span>
            </label>
            <input
              id="invite-code"
              type="text"
              className="form-input"
              placeholder="e.g. JOIN-ALPHA"
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value)}
              required
            />
            <span className="form-hint">Paste the invite code shared by your squad leader.</span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setJoinModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Join Team
            </button>
          </div>
        </form>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Teammate via Email"
      >
        <form onSubmit={handleSendInvite}>
          <div className="form-group">
            <label className="form-label" htmlFor="invite-email">
              Teammate Email Address <span className="required">*</span>
            </label>
            <input
              id="invite-email"
              type="email"
              className="form-input"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <span className="form-hint">We'll send an invite link with your squad's access code.</span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send Invite
            </button>
          </div>
        </form>
      </Modal>

      {/* Leave Team Modal */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Leave Team Confirmation"
      >
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          Are you sure you want to leave <strong>{myTeam?.name}</strong>? You will no longer have access to this team's project draft.
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setLeaveModalOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirmLeave}
          >
            Yes, Leave Team
          </button>
        </div>
      </Modal>
    </div>
  );
};
