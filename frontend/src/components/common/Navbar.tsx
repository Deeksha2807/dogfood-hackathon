import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useMode } from "../../context/ModeContext";
import { useHackathon } from "../../context/HackathonContext";
import { useToast } from "../../context/ToastContext";
import {
  Code2,
  Shield,
  Award,
  Users,
  LogOut,
  ChevronDown,
  Activity,
  Zap,
  Check,
  Sun,
  Moon,
  Bell,
  Sparkles,
  Menu,
  X,
  Clock,
  Radio,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin, isSuperAdmin, isOrganizer, isJudge, isParticipant } = useAuth();
  const { backendOnline, isLiveApi, setIsLiveApi } = useMode();
  const { theme, toggleTheme, notifications, markNotificationRead, clearAllNotifications, eventConfig } = useHackathon();
  const { info, success } = useToast();
  const navigate = useNavigate();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleQuickRole = async (role: "admin" | "organizer" | "judge" | "participant") => {
    await quickLogin(role);
    setRoleDropdownOpen(false);
    success(`Switched role to ${role.toUpperCase()}`);
    if (role === "admin" || role === "organizer") {
      navigate("/admin");
    } else if (role === "judge") {
      navigate("/judge");
    } else {
      navigate("/dashboard");
    }
  };

  const handleLogout = async () => {
    await logout();
    info("Logged out successfully");
    navigate("/login");
  };

  const roleName = user?.globalRole === "SUPER_ADMIN" ? "ADMIN" : isOrganizer ? "ORGANIZER" : isJudge ? "JUDGE" : "PARTICIPANT";
  const roleColor = roleName === "ADMIN" ? "var(--accent-rose)" : roleName === "ORGANIZER" ? "var(--accent-cyan)" : roleName === "JUDGE" ? "var(--primary)" : "var(--accent-emerald)";

  return (
    <header
      style={{
        height: "64px",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand & Left items */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            textDecoration: "none",
            color: "var(--text-primary)",
            fontWeight: 800,
            fontSize: "1.15rem",
            letterSpacing: "-0.03em",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)",
              color: "#FFFFFF",
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 12px rgba(99, 102, 241, 0.4)",
            }}
          >
            <Code2 size={18} />
          </div>
          <span>
            HACK<span style={{ color: "var(--primary)" }}>FORGE</span>
          </span>
        </Link>

        {/* Event Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.25rem 0.75rem",
            borderRadius: "var(--radius-full)",
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
          className="event-header-badge"
        >
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "var(--accent-emerald)",
              boxShadow: "0 0 8px #10B981",
            }}
          />
          <span>{eventConfig?.name || "DogFood Hackathon 2026"}</span>
          <span className="badge badge-success" style={{ fontSize: "0.65rem", padding: "0.1rem 0.4rem" }}>
            LIVE
          </span>
        </div>

        {/* Backend health status badge */}
        <div
          onClick={() => {
            setIsLiveApi(!isLiveApi);
            info(!isLiveApi ? "Live API Mode enabled" : "Demo Mock Mode enabled");
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.25rem 0.625rem",
            borderRadius: "var(--radius-full)",
            background: backendOnline ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
            border: `1px solid ${backendOnline ? "rgba(16, 185, 129, 0.3)" : "rgba(245, 158, 11, 0.3)"}`,
            fontSize: "0.75rem",
            fontWeight: 500,
            color: backendOnline ? "#6EE7B7" : "#FCD34D",
            cursor: "pointer",
          }}
          title="Click to toggle Live API / Demo Fallback Mode"
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: backendOnline ? "var(--accent-emerald)" : "var(--accent-amber)",
              boxShadow: backendOnline ? "0 0 6px #10B981" : "0 0 6px #F59E0B",
            }}
          />
          <span>{backendOnline ? "API Live: 5000" : "Demo Mode"}</span>
        </div>
      </div>

      {/* Right side controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Dark / Light Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn-icon"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-color)",
            background: "var(--bg-input)",
            color: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all var(--transition)",
          }}
        >
          {theme === "dark" ? (
            <Sun size={18} color="var(--accent-amber)" />
          ) : (
            <Moon size={18} color="var(--primary)" />
          )}
        </button>

        {/* Notifications Bell */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="btn-icon"
            title="Notifications"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-input)",
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Bell size={18} color="var(--text-secondary)" />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "var(--accent-rose)",
                  color: "#FFFFFF",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid var(--bg-secondary)",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.5rem",
                width: "320px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                padding: "0.75rem",
                zIndex: 100,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
                <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                  Notifications
                </span>
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Clear all
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "280px", overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      style={{
                        padding: "0.5rem 0.6rem",
                        borderRadius: "var(--radius-sm)",
                        background: n.unread ? "var(--primary-light)" : "var(--bg-input)",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "var(--text-primary)" }}>{n.title}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{n.timestamp}</span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: 0 }}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Pill Badge */}
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            padding: "0.25rem 0.75rem",
            borderRadius: "var(--radius-full)",
            background: `${roleColor}18`,
            color: roleColor,
            border: `1px solid ${roleColor}40`,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {roleName}
        </span>

        {/* Quick Demo Switcher */}
        <div style={{ position: "relative" }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.8rem",
              background: "var(--bg-card)",
            }}
          >
            <Zap size={14} color="var(--primary)" />
            <span>Switch Role</span>
            <ChevronDown size={14} />
          </button>

          {roleDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.5rem",
                width: "220px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                padding: "0.5rem",
                zIndex: 100,
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", padding: "0.25rem 0.5rem", textTransform: "uppercase", fontWeight: 600 }}>
                Switch Demo Persona
              </div>
              <button
                onClick={() => handleQuickRole("participant")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem",
                  background: isParticipant && !isOrganizer && !isJudge ? "var(--primary-light)" : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Users size={14} color="var(--text-secondary)" /> Participant (Alice)
                </span>
                {isParticipant && !isOrganizer && !isJudge && <Check size={14} color="var(--primary)" />}
              </button>
              <button
                onClick={() => handleQuickRole("judge")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem",
                  background: isJudge ? "var(--primary-light)" : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Award size={14} color="var(--primary)" /> Judge (Dr. Brody)
                </span>
                {isJudge && <Check size={14} color="var(--primary)" />}
              </button>
              <button
                onClick={() => handleQuickRole("organizer")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem",
                  background: isOrganizer && !isSuperAdmin ? "var(--primary-light)" : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Shield size={14} color="var(--accent-cyan)" /> Organizer (Elena)
                </span>
                {isOrganizer && !isSuperAdmin && <Check size={14} color="var(--primary)" />}
              </button>
              <button
                onClick={() => handleQuickRole("admin")}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.5rem",
                  background: isSuperAdmin ? "var(--primary-light)" : "transparent",
                  border: "none",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Shield size={14} color="var(--accent-rose)" /> Super Admin
                </span>
                {isSuperAdmin && <Check size={14} color="var(--primary)" />}
              </button>
            </div>
          )}
        </div>

        {/* User Profile */}
        {user ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "var(--radius-full)",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {user.name}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {user.email}
                </span>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {profileDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "0.5rem",
                  width: "200px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  padding: "0.5rem",
                  zIndex: 100,
                }}
              >
                <div style={{ padding: "0.5rem", borderBottom: "1px solid var(--border-subtle)", marginBottom: "0.25rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)" }}>{user.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem",
                    background: "transparent",
                    border: "none",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--accent-rose)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
