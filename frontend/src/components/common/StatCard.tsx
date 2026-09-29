import React, { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
}) => {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        cursor: onClick ? "pointer" : "default",
        padding: "1.25rem 1.5rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-secondary)" }}>
          {title}
        </span>
        {icon && (
          <div
            style={{
              padding: "0.5rem",
              borderRadius: "var(--radius-md)",
              background: "var(--primary-light)",
              color: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
        {value}
      </div>

      {(subtitle || trend) && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem" }}>
          {trend && (
            <span
              style={{
                color: trend.positive ? "var(--accent-emerald)" : "var(--accent-rose)",
                fontWeight: 600,
              }}
            >
              {trend.value}
            </span>
          )}
          {subtitle && <span style={{ color: "var(--text-muted)" }}>{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
