import React from "react";
import { History, CheckCircle2, Heart, UserPlus, FileEdit, FolderCheck } from "lucide-react";

export const MyActivity: React.FC = () => {
  const activities = [
    {
      id: "act-1",
      icon: <FolderCheck size={18} color="var(--accent-emerald)" />,
      title: "Project Submitted & Finalized",
      description: "Submitted AgentForge AutoPilot for judging evaluation.",
      timestamp: "Today at 2:15 PM",
    },
    {
      id: "act-2",
      icon: <Heart size={18} color="var(--accent-rose)" />,
      title: "Voted for Project",
      description: "Cast community vote for DevShield Sentinel.",
      timestamp: "Today at 11:30 AM",
    },
    {
      id: "act-3",
      icon: <FileEdit size={18} color="var(--primary)" />,
      title: "Updated Submission Draft",
      description: "Updated GitHub repository and live demo URLs.",
      timestamp: "Yesterday at 6:45 PM",
    },
    {
      id: "act-4",
      icon: <UserPlus size={18} color="var(--accent-cyan)" />,
      title: "Joined Team AlphaForge",
      description: "Accepted team invitation and joined as member.",
      timestamp: "2 days ago",
    },
  ];

  return (
    <div className="page-wrapper" style={{ maxWidth: "800px" }}>
      <div className="page-header">
        <div className="page-title">
          <h1>
            <History size={28} color="var(--primary)" /> Activity Timeline
          </h1>
          <p>Recent actions, submissions, and community events on your account</p>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {activities.map((item, idx) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                paddingBottom: idx !== activities.length - 1 ? "1.25rem" : 0,
                borderBottom: idx !== activities.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--bg-input)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {item.icon}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{item.title}</h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.timestamp}</span>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
