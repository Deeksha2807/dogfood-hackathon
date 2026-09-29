import React, { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "3.5rem 1.5rem",
        background: "var(--bg-card)",
        border: "1px dashed var(--border-color)",
        borderRadius: "var(--radius-lg)",
        margin: "1rem 0",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "var(--radius-full)",
          background: "var(--bg-card-hover)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-muted)",
          marginBottom: "1rem",
        }}
      >
        {icon || <FolderOpen size={24} />}
      </div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
        {title}
      </h3>
      {description && (
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "420px", marginBottom: "1.25rem" }}>
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
