import React, { useState } from "react";
import { useHackathon } from "../../context/HackathonContext";
import { User, Building, Phone, Sparkles, CheckCircle2 } from "lucide-react";

export const OnboardingModal: React.FC = () => {
  const { user, completeOnboarding } = useHackathon();
  const [name, setName] = useState(user?.name || "");
  const [collegeCompany, setCollegeCompany] = useState(user?.collegeCompany || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [error, setError] = useState("");

  if (!user || user.isOnboarded) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide your full legal or preferred name.");
      return;
    }
    if (!collegeCompany.trim()) {
      setError("Please provide your university, college, or company affiliation.");
      return;
    }
    if (!phone.trim()) {
      setError("Please provide a contact phone number for hackathon communications.");
      return;
    }

    completeOnboarding({
      name: name.trim(),
      collegeCompany: collegeCompany.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: "520px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
            padding: "1.5rem 1.5rem 1rem",
            borderBottom: "1px solid var(--border-color)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              marginBottom: "0.75rem",
              boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)",
            }}
          >
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.25rem" }}>
            Welcome to HackForge!
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Complete your quick hacker profile for DogFood Hackathon 2026. This information is verified against your Google account for team formation and prize awards.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
          {error && (
            <div
              style={{
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(244, 63, 94, 0.15)",
                border: "1px solid rgba(244, 63, 94, 0.3)",
                color: "#FDA4AF",
                fontSize: "0.85rem",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Alice Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: "2.25rem" }}
              />
              <User
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              College / University or Company <span className="required">*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Stanford University or Anthropic"
                value={collegeCompany}
                onChange={(e) => setCollegeCompany(e.target.value)}
                style={{ paddingLeft: "2.25rem" }}
              />
              <Building
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +1 (555) 234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: "2.25rem" }}
              />
              <Phone
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
            <span className="form-hint">Used strictly for emergency day-of-event notifications.</span>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "0.75rem" }}>
              <CheckCircle2 size={18} /> Complete Onboarding & Enter Portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
