import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "Failed to load data from the server. Please check your connection or retry.",
  onRetry,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "3rem 1.5rem",
        background: "rgba(244, 63, 94, 0.05)",
        border: "1px solid rgba(244, 63, 94, 0.2)",
        borderRadius: "var(--radius-lg)",
        margin: "1rem 0",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "var(--radius-full)",
          background: "rgba(244, 63, 94, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent-rose)",
          marginBottom: "1rem",
        }}
      >
        <AlertCircle size={24} />
      </div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: "460px", marginBottom: "1.25rem" }}>
        {message}
      </p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          <RefreshCw size={14} /> Retry
        </button>
      )}
    </div>
  );
};
