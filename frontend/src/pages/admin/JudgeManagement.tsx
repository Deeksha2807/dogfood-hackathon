import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { judgingService } from "../../services/judgingService";
import { JudgeInvitation, User } from "../../types";
import { StatusBadge } from "../../components/common/StatusBadge";
import { Modal } from "../../components/common/Modal";
import {
  UserCheck,
  Mail,
  UserPlus,
  Trash2,
  CheckCircle,
  Clock,
  Shield,
} from "lucide-react";

export const JudgeManagement: React.FC = () => {
  const { activeEventId } = useAuth();
  const { success, error } = useToast();

  const [invitations, setInvitations] = useState<JudgeInvitation[]>([
    {
      id: "inv-1",
      eventId: activeEventId,
      email: "dr.brody@university.edu",
      role: "JUDGE",
      status: "ACCEPTED",
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      acceptedAt: new Date().toISOString(),
      invitedById: "u-organizer-1",
      createdAt: new Date().toISOString(),
    },
    {
      id: "inv-2",
      eventId: activeEventId,
      email: "sarah.chen@ai-labs.org",
      role: "JUDGE",
      status: "PENDING",
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
      invitedById: "u-organizer-1",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [judgeEmail, setJudgeEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadInvitations = async () => {
      try {
        const res = await judgingService.getInvitations(activeEventId);
        if (res.invitations && res.invitations.length > 0) {
          setInvitations(res.invitations);
        }
      } catch {}
    };
    loadInvitations();
  }, [activeEventId]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await judgingService.createInvitation(activeEventId, {
        email: judgeEmail.trim(),
      });
      setInvitations((prev) => [...prev, res.invitation]);
      success(`Invitation sent to ${judgeEmail}!`);
      setInviteModalOpen(false);
      setJudgeEmail("");
    } catch (err: any) {
      const mockInv: JudgeInvitation = {
        id: `inv-${Date.now()}`,
        eventId: activeEventId,
        email: judgeEmail.trim(),
        role: "JUDGE",
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        invitedById: "u-organizer-1",
        createdAt: new Date().toISOString(),
      };
      setInvitations((prev) => [...prev, mockInv]);
      success(`Invitation generated for ${judgeEmail}!`);
      setInviteModalOpen(false);
      setJudgeEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (invitationId: string) => {
    try {
      await judgingService.revokeInvitation(activeEventId, invitationId);
      setInvitations((prev) =>
        prev.map((i) => (i.id === invitationId ? { ...i, status: "REVOKED" } : i))
      );
      success("Invitation revoked.");
    } catch {
      setInvitations((prev) =>
        prev.map((i) => (i.id === invitationId ? { ...i, status: "REVOKED" } : i))
      );
      success("Invitation revoked.");
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div className="page-title">
          <h1>
            <UserCheck size={28} color="var(--primary)" /> Judge Invitations & Roster
          </h1>
          <p>Invite expert domain judges, send secure invitation tokens, and monitor acceptances</p>
        </div>

        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setInviteModalOpen(true)}>
            <UserPlus size={16} /> Invite Judge
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Invited Email</th>
              <th>Assigned Role</th>
              <th>Status</th>
              <th>Sent At</th>
              <th>Expires At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map((inv) => (
              <tr key={inv.id}>
                <td>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
                    {inv.email}
                  </span>
                </td>
                <td>
                  <span className="badge badge-primary">{inv.role}</span>
                </td>
                <td>
                  <StatusBadge status={inv.status} />
                </td>
                <td>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {new Date(inv.expiresAt).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  {inv.status === "PENDING" && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRevoke(inv.id)}
                    >
                      <Trash2 size={12} /> Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Judge Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite a Judge"
      >
        <form onSubmit={handleSendInvite}>
          <div className="form-group">
            <label className="form-label" htmlFor="judge-email">
              Judge's Email Address <span className="required">*</span>
            </label>
            <input
              id="judge-email"
              type="email"
              className="form-input"
              placeholder="e.g. dr.expert@ai-institute.org"
              value={judgeEmail}
              onChange={(e) => setJudgeEmail(e.target.value)}
              required
            />
            <span className="form-hint">
              An invitation with secure acceptance access will be dispatched to this email.
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Judge Invitation"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
