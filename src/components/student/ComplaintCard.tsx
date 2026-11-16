import React from "react";
import Link from "next/link";
import { MapPin, Calendar, ArrowRight, MessageSquare, Image as ImageIcon } from "lucide-react";
import { Complaint } from "@/types";
import { StatusBadge } from "../ui/StatusBadge";
import { PriorityBadge } from "../ui/PriorityBadge";
import { CategoryIcon } from "../ui/CategoryIcon";

interface ComplaintCardProps {
  complaint: Complaint;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top bar: Ticket ID & Status */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
              #{complaint.ticketId}
            </span>
            <PriorityBadge priority={complaint.priority} />
          </div>
          <StatusBadge status={complaint.status} size="sm" />
        </div>

        {/* Title & Category */}
        <div className="mt-3.5">
          <div className="flex items-center gap-2 text-xs font-medium text-purple-700 mb-1">
            <CategoryIcon category={complaint.category} className="w-3.5 h-3.5" />
            <span>{complaint.category}</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {complaint.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* Location & Meta info */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span className="line-clamp-1 font-medium">{complaint.building}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pl-5">
            <span>{complaint.roomFloor}</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>
                {new Date(complaint.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Admin remarks preview snippet if present */}
        {complaint.adminRemarks && (
          <div className="mt-3 bg-purple-50/70 border border-purple-100 rounded-lg p-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-purple-900 mb-0.5 text-[11px]">
              <MessageSquare className="w-3 h-3 text-purple-600" />
              <span>Admin Remarks:</span>
            </div>
            <p className="text-purple-800 line-clamp-1 text-[11px] italic">
              &quot;{complaint.adminRemarks}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Footer / Track Button */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {complaint.photoUrl && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              <ImageIcon className="w-3 h-3" />
              Photo
            </span>
          )}
        </div>
        <Link
          href={`/complaints/${complaint.ticketId}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors group-hover:translate-x-0.5"
        >
          <span>Track Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
