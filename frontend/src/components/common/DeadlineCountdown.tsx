import React, { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface DeadlineCountdownProps {
  deadline: string | Date;
  title?: string;
  onExpire?: () => void;
  compact?: boolean;
}

export const DeadlineCountdown: React.FC<DeadlineCountdownProps> = ({
  deadline,
  title = "Submission Deadline",
  onExpire,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    isUrgent: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isUrgent: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(deadline).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isUrgent: false,
        });
        if (onExpire) onExpire();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const isUrgent = diff < 24 * 60 * 60 * 1000; // Less than 24 hours left

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false, isUrgent });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [deadline, onExpire]);

  if (compact) {
    if (timeLeft.isExpired) {
      return (
        <span className="badge badge-danger" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
          <AlertTriangle size={12} /> Deadline Passed
        </span>
      );
    }
    return (
      <span
        className={`badge ${timeLeft.isUrgent ? "badge-warning" : "badge-primary"}`}
        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
      >
        <Clock size={12} />
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
        {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
        {String(timeLeft.seconds).padStart(2, "0")} left
      </span>
    );
  }

  return (
    <div
      className="card"
      style={{
        background: timeLeft.isExpired
          ? "rgba(244, 63, 94, 0.08)"
          : timeLeft.isUrgent
          ? "rgba(245, 158, 11, 0.08)"
          : "rgba(99, 102, 241, 0.08)",
        borderColor: timeLeft.isExpired
          ? "rgba(244, 63, 94, 0.3)"
          : timeLeft.isUrgent
          ? "rgba(245, 158, 11, 0.3)"
          : "rgba(99, 102, 241, 0.3)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, color: "var(--text-primary)" }}>
          {timeLeft.isExpired ? (
            <AlertTriangle size={18} color="var(--accent-rose)" />
          ) : timeLeft.isUrgent ? (
            <AlertTriangle size={18} color="var(--accent-amber)" />
          ) : (
            <Clock size={18} color="var(--primary)" />
          )}
          <span>{title}</span>
        </div>
        <span
          className={`badge ${
            timeLeft.isExpired ? "badge-danger" : timeLeft.isUrgent ? "badge-warning" : "badge-primary"
          }`}
        >
          {timeLeft.isExpired ? "Closed" : timeLeft.isUrgent ? "Urgent" : "Active"}
        </span>
      </div>

      {timeLeft.isExpired ? (
        <div style={{ color: "var(--accent-rose)", fontSize: "0.95rem", fontWeight: 500 }}>
          Submissions are now closed. No new changes will be accepted.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", textAlign: "center" }}>
          <div style={{ background: "var(--bg-input)", padding: "0.5rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {timeLeft.days}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Days</div>
          </div>
          <div style={{ background: "var(--bg-input)", padding: "0.5rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {String(timeLeft.hours).padStart(2, "0")}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Hours</div>
          </div>
          <div style={{ background: "var(--bg-input)", padding: "0.5rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {String(timeLeft.minutes).padStart(2, "0")}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Mins</div>
          </div>
          <div style={{ background: "var(--bg-input)", padding: "0.5rem", borderRadius: "var(--radius-md)" }}>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {String(timeLeft.seconds).padStart(2, "0")}
            </div>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Secs</div>
          </div>
        </div>
      )}
    </div>
  );
};
