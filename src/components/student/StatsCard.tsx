import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
  gradient: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  gradient,
  iconBg,
  iconColor,
  borderColor,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-5 sm:p-6 border ${borderColor} shadow-sm hover:shadow-md transition-all duration-200 group`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${gradient}`} />
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">{description}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-200`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
