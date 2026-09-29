import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const norm = (status || "").trim().toUpperCase().replace(/[\s-]/g, "_");

  let badgeClass = "badge-neutral";
  let label = status;

  switch (norm) {
    case "ACTIVE":
    case "DONE":
    case "COMPLETED":
    case "ACCEPTED":
      badgeClass = "badge-success";
      label = "Active";
      break;
    case "SUBMITTED":
      badgeClass = "badge-success";
      label = "Submitted";
      break;
    case "JUDGED":
      badgeClass = "badge-cyan";
      label = "Judged";
      break;
    case "DRAFT":
      badgeClass = "badge-warning";
      label = "Draft";
      break;
    case "PENDING":
    case "UPCOMING":
      badgeClass = "badge-warning";
      label = "Pending";
      break;
    case "UNDER_REVIEW":
      badgeClass = "badge-primary";
      label = "Under Review";
      break;
    case "IN_PROGRESS":
    case "JUDGING":
      badgeClass = "badge-primary";
      label = "In Progress";
      break;
    case "DISQUALIFIED":
    case "REJECTED":
    case "REVOKED":
    case "EXPIRED":
      badgeClass = "badge-danger";
      label = norm === "DISQUALIFIED" ? "Disqualified" : "Rejected";
      break;
    case "SUPER_ADMIN":
    case "ADMIN":
    case "ORGANIZER":
      badgeClass = "badge-cyan";
      label = "Admin";
      break;
    case "JUDGE":
      badgeClass = "badge-primary";
      label = "Judge";
      break;
    case "PARTICIPANT":
      badgeClass = "badge-neutral";
      label = "Participant";
      break;
    default:
      badgeClass = "badge-neutral";
      label = status || "Active";
  }

  return <span className={`badge ${badgeClass} ${className}`}>{label}</span>;
};
