"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Building,
  Image as ImageIcon,
  Copy,
  Check,
  Printer,
  ShieldCheck,
  User,
  Share2,
} from "lucide-react";
import { Complaint } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { getComplaintById } from "@/lib/services/complaintService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { TimelineStepper } from "@/components/student/TimelineStepper";

export default function ComplaintTrackingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const ticketIdOrId = params.id as string;

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      try {
        const data = await getComplaintById(ticketIdOrId);
        setComplaint(data);
      } catch (err) {
        console.error("Error loading ticket:", err);
      } finally {
        setLoading(false);
      }
    };

    if (ticketIdOrId) {
      fetchTicket();
    }
  }, [ticketIdOrId]);

  const copyTicketId = () => {
    if (complaint) {
      navigator.clipboard.writeText(complaint.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-600">Retrieving Ticket Data...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          We could not locate ticket <span className="font-mono font-bold">#{ticketIdOrId}</span>. Please verify the ticket ID and try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/complaints"
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
          >
            Back to Complaints
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button and actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Complaints</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Print Receipt</span>
          </button>
        </div>
      </div>

      {/* Ticket Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Maintenance Ticket
              </span>
              <button
                onClick={copyTicketId}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-mono bg-indigo-50 px-2 py-0.5 rounded transition-colors"
                title="Copy Ticket ID"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy ID"}</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-mono text-indigo-900 tracking-tight mt-1">
              #{complaint.ticketId}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} size="lg" />
          </div>
        </div>

        {/* Complaint Title & Category */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
            <CategoryIcon category={complaint.category} className="w-4 h-4" />
            <span>{complaint.category}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {complaint.title}
          </h2>
        </div>

        {/* Location & Time specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs text-slate-600 border-t border-slate-100">
          <div className="flex items-start gap-2">
            <Building className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">{complaint.building}</p>
              <p className="text-slate-500">{complaint.roomFloor}</p>
              {complaint.locationDetails && (
                <p className="text-indigo-600 italic mt-0.5 font-sans">
                  Note: {complaint.locationDetails}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Lodged Date</p>
              <p className="text-slate-500">
                {new Date(complaint.createdAt).toLocaleString(undefined, {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
              {complaint.resolvedAt && (
                <p className="text-emerald-600 font-semibold mt-0.5">
                  Resolved on: {new Date(complaint.resolvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Lifecycle Stepper */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Real-time Maintenance Lifecycle</span>
        </h3>
        <TimelineStepper
          currentStatus={complaint.status}
          timeline={complaint.timeline}
          createdAt={complaint.createdAt}
          resolvedAt={complaint.resolvedAt}
        />
      </div>

      {/* ADMIN REMARKS SECTION - Requirement 5 */}
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50/50 to-blue-50 rounded-3xl p-6 sm:p-8 border-2 border-purple-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-purple-950 uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            <span>Facilities Administration Remarks</span>
          </h3>
          <span className="text-[11px] font-semibold text-purple-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-purple-200">
            Official Estate Update
          </span>
        </div>

        {complaint.adminRemarks ? (
          <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              &quot;{complaint.adminRemarks}&quot;
            </p>
            {complaint.assignedTo && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-indigo-700 font-semibold">
                <Wrench className="w-3.5 h-3.5" />
                <span>Assigned Unit: {complaint.assignedTo}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 rounded-2xl p-5 border border-purple-100 text-center">
            <p className="text-xs text-slate-500 italic">
              No administrator remarks have been recorded for this ticket yet. Facilities personnel will update this section upon triage.
            </p>
          </div>
        )}
      </div>

      {/* Complaint Description & Photo Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
            Student Complaint Description
          </h3>
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100">
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
              {complaint.description}
            </p>
          </div>
        </div>

        {/* Uploaded Photo Evidence */}
        {complaint.photoUrl && (
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              <span>Attached Photo Evidence</span>
            </h3>

            <div
              onClick={() => setPhotoModalOpen(true)}
              className="relative w-full max-w-md h-64 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group shadow-sm hover:shadow-md transition-all"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={complaint.photoUrl}
                alt="Defect Attachment"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center">
                <span className="px-3 py-1.5 rounded-xl bg-white/90 text-xs font-bold text-slate-900 backdrop-blur-sm opacity-90 group-hover:opacity-100 shadow">
                  Click to Zoom Photo
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal for Photo */}
      {photoModalOpen && complaint.photoUrl && (
        <div
          onClick={() => setPhotoModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={complaint.photoUrl}
              alt="Enlarged Defect Evidence"
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
            <p className="text-center text-xs text-white/80 mt-2">
              Click anywhere to close lightbox
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
