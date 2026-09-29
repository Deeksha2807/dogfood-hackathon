import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Modal } from "../../components/common/Modal";
import { Code2, Lock, Mail, ArrowRight, Shield, Award, Users, Sparkles, CheckCircle2 } from "lucide-react";

export const Login: React.FC = () => {
  const { login, loginWithGoogle, quickLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // Initialize real Google Identity Services (GSI) if available
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1083472918471-demo-hackforge.apps.googleusercontent.com";
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            if (response.credential) {
              await handleGoogleAuth({ credential: response.credential });
            }
          },
        });

        if (googleBtnRef.current) {
          (window as any).google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "rectangular",
          });
        }
      } catch (e) {
        // GSI initialization error ignored in offline environments
      }
    }
  }, []);

  const handleGoogleAuth = async (payload: { credential?: string; email?: string; name?: string }) => {
    setIsGoogleLoading(true);
    try {
      const user = await loginWithGoogle(payload);
      success(`Google Sign-In successful! Signed in as ${user.name}`);
      
      // Determine navigation route strictly based on DB-determined role
      if (user.globalRole === "SUPER_ADMIN" || user.eventRoles?.some((r) => r.role === "ORGANIZER")) {
        navigate("/admin", { replace: true });
      } else if (user.eventRoles?.some((r) => r.role === "JUDGE") || user.email.includes("judge")) {
        navigate("/judge", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      error(err.message || "Google authentication failed.");
    } finally {
      setIsGoogleLoading(false);
      setShowGoogleModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please provide both email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login({ email, password });
      success(`Welcome back, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err: any) {
      error(err.message || "Invalid login credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuick = async (role: "admin" | "organizer" | "judge" | "participant") => {
    await quickLogin(role);
    success(`Logged in as demo ${role.toUpperCase()}`);
    if (role === "admin" || role === "organizer") {
      navigate("/admin");
    } else if (role === "judge") {
      navigate("/judge");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "radial-gradient(ellipse at top, #1E1B4B 0%, #0B0F19 60%)",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "2.5rem 2rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
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
              boxShadow: "0 0 20px rgba(99, 102, 241, 0.5)",
              marginBottom: "1rem",
            }}
          >
            <Code2 size={26} />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.25rem" }}>
            Sign In to HackForge
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Autonomous Hackathon & Judging Platform
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div
          style={{
            background: "var(--bg-input)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "0.875rem",
            marginBottom: "1.75rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.5rem" }}>
            <Sparkles size={13} color="var(--primary)" /> 1-Click Quick Demo Sign In
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.4rem" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuick("participant")}
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.5rem", justifyContent: "flex-start" }}
            >
              <Users size={13} color="var(--text-secondary)" /> Participant
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuick("judge")}
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.5rem", justifyContent: "flex-start" }}
            >
              <Award size={13} color="var(--primary)" /> Judge
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuick("organizer")}
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.5rem", justifyContent: "flex-start" }}
            >
              <Shield size={13} color="var(--accent-cyan)" /> Organizer
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuick("admin")}
              style={{ fontSize: "0.75rem", padding: "0.4rem 0.5rem", justifyContent: "flex-start" }}
            >
              <Shield size={13} color="var(--accent-rose)" /> Super Admin
            </button>
          </div>
        </div>

        {/* Google OAuth Sign In */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div ref={googleBtnRef} style={{ marginBottom: "0.5rem" }} />
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={() => setShowGoogleModal(true)}
            disabled={isGoogleLoading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              background: "#FFFFFF",
              color: "#1F2937",
              border: "1px solid #E5E7EB",
              fontWeight: 600,
              fontSize: "0.95rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-md)",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
              cursor: "pointer",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {isGoogleLoading ? "Connecting with Google..." : "Continue with Google"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", margin: "1.25rem 0", gap: "0.75rem" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            or with email & password
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="alice@hackathon.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: "2.25rem" }}
              />
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: "2.25rem" }}
              />
              <Lock
                size={16}
                color="var(--text-muted)"
                style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "0.75rem" }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer */}
        <div style={{ marginTop: "1.75rem", textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
            Create an Account
          </Link>
        </div>
      </div>

      {/* Google Sign-In Selector Modal */}
      {showGoogleModal && (
        <Modal
          isOpen={showGoogleModal}
          onClose={() => setShowGoogleModal(false)}
          title="Sign In with Google Account"
          maxWidth="480px"
        >
          <div style={{ padding: "0.5rem 0" }}>
            <div
              style={{
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: "var(--radius-md)",
                padding: "0.75rem 1rem",
                marginBottom: "1.25rem",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
                display: "flex",
                gap: "0.5rem",
                alignItems: "flex-start",
              }}
            >
              <CheckCircle2 size={16} color="var(--primary)" style={{ marginTop: "2px", flexShrink: 0 }} />
              <div>
                <strong>Database-Decided Roles:</strong> Your permissions (Admin, Judge, or Participant) are automatically determined by the database query for your verified email address.
              </div>
            </div>

            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              Select Google Account:
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
              {[
                { name: "System Administrator", email: "admin@hackathon.local", roleBadge: "Admin (Full Access)", color: "var(--accent-rose)", icon: Shield },
                { name: "Elena Vance", email: "organizer@hackathon.local", roleBadge: "Organizer (Admin)", color: "var(--accent-cyan)", icon: Shield },
                { name: "Dr. Marcus Brody", email: "judge1@hackathon.local", roleBadge: "Judge (Assigned Only)", color: "var(--primary)", icon: Award },
                { name: "Dr. Sarah Chen", email: "judge2@hackathon.local", roleBadge: "Judge (Assigned Only)", color: "var(--primary)", icon: Award },
                { name: "Alice Johnson", email: "alice@hackathon.local", roleBadge: "Participant (Team AlphaForge)", color: "var(--accent-emerald)", icon: Users },
              ].map((acc) => {
                const IconComponent = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleGoogleAuth({ email: acc.email, name: acc.name })}
                    disabled={isGoogleLoading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-color)",
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--primary)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-color)";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: `${acc.color}20`,
                          color: acc.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        <IconComponent size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>{acc.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{acc.email}</div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.6rem",
                        borderRadius: "12px",
                        background: `${acc.color}15`,
                        color: acc.color,
                        border: `1px solid ${acc.color}40`,
                      }}
                    >
                      {acc.roleBadge}
                    </span>
                  </button>
                );
              })}
            </div>

            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                Or test with custom Google email:
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="your-name@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (customGoogleEmail.trim()) {
                      handleGoogleAuth({ email: customGoogleEmail.trim() });
                    }
                  }}
                  disabled={!customGoogleEmail.trim() || isGoogleLoading}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
