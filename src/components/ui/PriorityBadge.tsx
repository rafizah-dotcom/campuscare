import React from "react";
import { ComplaintPriority } from "@/types";
import { PRIORITY_CONFIG } from "@/lib/constants";

interface PriorityBadgeProps {
  priority: ComplaintPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.badge}`}
    >
      {config.label}
    </span>
  );
};
