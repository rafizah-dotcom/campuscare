import React from "react";
import { CheckCircle2, Clock, AlertCircle, Wrench, ShieldAlert } from "lucide-react";
import { ComplaintStatus, ComplaintTimelineItem } from "@/types";

interface TimelineStepperProps {
  currentStatus: ComplaintStatus;
  timeline?: ComplaintTimelineItem[];
  createdAt: string;
  resolvedAt?: string;
}

export const TimelineStepper: React.FC<TimelineStepperProps> = ({
  currentStatus,
  timeline = [],
  createdAt,
  resolvedAt,
}) => {
  const isRejected = currentStatus === "Rejected";

  const steps: {
    status: ComplaintStatus | "Review";
    title: string;
    description: string;
    isCompleted: boolean;
    isCurrent: boolean;
  }[] = [
    {
      status: "Submitted",
      title: "Complaint Lodged",
      description: "Submitted by student and registered into campus facility queue.",
      isCompleted: true,
      isCurrent: currentStatus === "Submitted",
    },
    {
      status: "In Progress",
      title: "Inspection & Repair in Progress",
      description: "Maintenance team dispatched and technical rectifications are underway.",
      isCompleted: currentStatus === "In Progress" || currentStatus === "Resolved",
      isCurrent: currentStatus === "In Progress",
    },
    {
      status: "Resolved",
      title: isRejected ? "Report Closed" : "Issue Resolved",
      description: isRejected
        ? "Report closed by facilities administrator."
        : "Work completed, verified by inspection, and ticket marked as resolved.",
      isCompleted: currentStatus === "Resolved" || isRejected,
      isCurrent: currentStatus === "Resolved" || isRejected,
    },
  ];

  return (
    <div className="py-2">
      <div className="relative">
        {/* Track line */}
        <div className="hidden sm:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-slate-200" />
        
        {/* Step circles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => {
            let circleBg = "bg-white border-2 border-slate-300 text-slate-400";
            if (step.isCurrent) {
              circleBg =
                currentStatus === "Resolved"
                  ? "bg-emerald-600 border-2 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-100"
                  : isRejected
                  ? "bg-rose-600 border-2 border-rose-600 text-white shadow-lg shadow-rose-500/30 ring-4 ring-rose-100"
                  : currentStatus === "In Progress"
                  ? "bg-blue-600 border-2 border-blue-600 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-100"
                  : "bg-amber-500 border-2 border-amber-500 text-white shadow-lg shadow-amber-500/30 ring-4 ring-amber-100";
            } else if (step.isCompleted) {
              circleBg = "bg-indigo-600 border-2 border-indigo-600 text-white";
            }

            return (
              <div
                key={step.title}
                className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3.5 sm:gap-2 bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-100"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all duration-200 ${circleBg}`}
                >
                  {step.isCompleted && !step.isCurrent ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : step.isCurrent && currentStatus === "In Progress" ? (
                    <Wrench className="w-5 h-5 animate-spin" />
                  ) : step.isCurrent && currentStatus === "Resolved" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : step.isCurrent && isRejected ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800">{step.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Activity Logs */}
      {timeline.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            Audit Trail & Event Log
          </h4>
          <div className="space-y-3">
            {timeline.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="font-semibold text-slate-800">{entry.actionBy}</span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(entry.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{entry.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
