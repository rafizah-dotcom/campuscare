import React from "react";
import { ComplaintStatus } from "@/types";
import { STATUS_CONFIG } from "@/lib/constants";

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  showDot = true,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Submitted;

  const sizeClasses = {
    sm: "text-xs px-2.5 py-0.5",
    md: "text-xs px-3 py-1 font-medium",
    lg: "text-sm px-3.5 py-1.5 font-semibold",
  };

  const dotSizes = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm transition-all duration-200 ${config.bg} ${config.border} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`rounded-full ${dotSizes[size]} ${config.dot} ${
            status === "In Progress" ? "animate-pulse" : ""
          }`}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};
