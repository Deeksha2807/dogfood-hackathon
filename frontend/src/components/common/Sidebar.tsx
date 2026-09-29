import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Layers,
  Compass,
  History,
  Calendar,
  UserCheck,
  FileCheck,
  Scale,
  Sliders,
  BarChart3,
  Vote,
  Sparkles,
  ClipboardList,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user, isSuperAdmin, isOrganizer, isJudge } = useAuth();
  const location = useLocation();

  // Determine section view
  const isAdminView =
    location.pathname.startsWith("/admin") ||
    ((isOrganizer || isSuperAdmin) && (
      location.pathname === "/events" ||
      location.pathname === "/users" ||
      location.pathname === "/teams" ||
      location.pathname === "/submissions" ||
      location.pathname === "/judges" ||
      location.pathname === "/assignments" ||
      location.pathname === "/rubrics"
    ));

  const isJudgeView = location.pathname.startsWith("/judge");

  return (
    <aside
      style={{
        width: "240px",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        padding: "1.25rem 0.75rem",
      }}
    >
      {/* View Section Tabs if multi-role authorized */}
      {(isOrganizer || isSuperAdmin) && (
        <div
          style={{
            display: "flex",
            gap: "4px",
            background: "var(--bg-input)",
            padding: "4px",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.25rem",
          }}
        >
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              flex: 1,
              padding: "0.35rem",
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              color: !isAdminView && !isJudgeView ? "var(--text-primary)" : "var(--text-muted)",
              background: !isAdminView && !isJudgeView ? "var(--bg-card)" : "transparent",
            })}
          >
            Participant
          </NavLink>
          <NavLink
            to="/admin"
            style={({ isActive }) => ({
              flex: 1,
              padding: "0.35rem",
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              color: isAdminView ? "var(--text-primary)" : "var(--text-muted)",
              background: isAdminView ? "var(--bg-card)" : "transparent",
            })}
          >
            Admin
          </NavLink>
          <NavLink
            to="/judge"
            style={({ isActive }) => ({
              flex: 1,
              padding: "0.35rem",
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              color: isJudgeView ? "var(--text-primary)" : "var(--text-muted)",
              background: isJudgeView ? "var(--bg-card)" : "transparent",
            })}
          >
            Judge
          </NavLink>
        </div>
      )}

      {/* Navigation Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
        {isAdminView ? (
          <>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", padding: "0.5rem 0.75rem" }}>
              Admin Portal
            </div>
            <SidebarLink to="/admin" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <SidebarLink to="/admin/participants" icon={<Users size={18} />} label="Participants" />
            <SidebarLink to="/admin/teams" icon={<Layers size={18} />} label="Teams" />
            <SidebarLink to="/admin/tracks" icon={<Compass size={18} />} label="Tracks" />
            <SidebarLink to="/admin/submissions" icon={<FolderGit2 size={18} />} label="Submissions" />
            <SidebarLink to="/admin/judging" icon={<Scale size={18} />} label="Judging" />
            <SidebarLink to="/admin/results" icon={<BarChart3 size={18} />} label="Results" />
            <SidebarLink to="/admin/settings" icon={<Sliders size={18} />} label="Settings" />
          </>
        ) : isJudgeView ? (
          <>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", padding: "0.5rem 0.75rem" }}>
              Judge Portal
            </div>
            <SidebarLink to="/judge" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <SidebarLink to="/judge/projects" icon={<ClipboardList size={18} />} label="Assigned Projects" />
            <SidebarLink to="/gallery" icon={<Layers size={18} />} label="Project Gallery" />
          </>
        ) : (
          <>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", padding: "0.5rem 0.75rem" }}>
              Participant Portal
            </div>
            <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <SidebarLink to="/team" icon={<Users size={18} />} label="My Team" />
            <SidebarLink to="/project" icon={<FolderGit2 size={18} />} label="My Submission" />
            <SidebarLink to="/tracks" icon={<Compass size={18} />} label="Tracks" />
            <SidebarLink to="/gallery" icon={<Layers size={18} />} label="Project Gallery" />
            <SidebarLink to="/results" icon={<BarChart3 size={18} />} label="Results" />
            <SidebarLink to="/rules" icon={<ClipboardList size={18} />} label="Rules & Criteria" />
          </>
        )}
      </nav>

      {/* Footer Info */}
      <div
        style={{
          padding: "0.75rem",
          borderRadius: "var(--radius-md)",
          background: "var(--bg-input)",
          border: "1px solid var(--border-subtle)",
          fontSize: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--text-primary)", fontWeight: 600, marginBottom: "2px" }}>
          <Sparkles size={14} color="var(--primary)" />
          <span>Hackathon 2026</span>
        </div>
        <div style={{ color: "var(--text-muted)" }}>
          Dogfood Evaluation v2.0
        </div>
      </div>
    </aside>
  );
};

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({
  to,
  icon,
  label,
}) => {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard" || to === "/admin" || to === "/judge"}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.625rem 0.875rem",
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontWeight: isActive ? 600 : 500,
        color: isActive ? "#FFFFFF" : "var(--text-secondary)",
        background: isActive ? "var(--primary)" : "transparent",
        transition: "var(--transition)",
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};
