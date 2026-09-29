import React from "react";
import { useHackathon } from "../../context/HackathonContext";
import { Clock, LogIn, AlertTriangle } from "lucide-react";

export const SessionExpiredModal: React.FC = () => {
  const { isSessionExpired, dismissSessionExpired, loginWithGoogle } = useHackathon();

  if (!isSessionExpired) return null;

  const handleReLogin = async () => {
    dismissSessionExpired();
    await loginWithGoogle();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: "460px", textAlign: "center", padding: "2rem" }}>
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "var(--accent-amber)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "1.25rem",
          }}
        >
          <Clock size={28} />
        </div>

        <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          Session Expired
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.75rem" }}>
          Your authentication token has expired to maintain secure audit trails and data integrity. Please sign in again with your Google account to resume your session.
        </p>

        <button
          onClick={handleReLogin}
          className="btn btn-primary"
          style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem" }}
        >
          <LogIn size={18} /> Re-authenticate with Google
        </button>
      </div>
    </div>
  );
};
