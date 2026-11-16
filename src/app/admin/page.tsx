"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wrench,
  AlertCircle,
  FileCode2,
  Database,
  Layers,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Users,
  RotateCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Complaint, ComplaintStatus } from "@/types";
import { getComplaints, updateComplaintStatus } from "@/lib/services/complaintService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

export default function AdminHandoverPage() {
  const { user, role, switchDemoRole } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>("In Progress");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const loadComplaints = async () => {
    const list = await getComplaints();
    setComplaints(list);
    if (list.length > 0 && !selectedComplaint) {
      setSelectedComplaint(list[0]);
      setNewStatus(list[0].status);
      setAdminRemarks(list[0].adminRemarks || "");
      setAssignedTo(list[0].assignedTo || "");
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleSelect = (c: Complaint) => {
    setSelectedComplaint(c);
    setNewStatus(c.status);
    setAdminRemarks(c.adminRemarks || "");
    setAssignedTo(c.assignedTo || "");
    setSuccessMsg("");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    setSuccessMsg("");

    try {
      const updated = await updateComplaintStatus(
        selectedComplaint.id,
        newStatus,
        adminRemarks,
        assignedTo,
        user?.fullName || "Facilities Admin"
      );

      if (updated) {
        setSelectedComplaint(updated);
        setSuccessMsg(`Successfully updated ticket #${updated.ticketId} to "${newStatus}"!`);
        await loadComplaints();
      }
    } catch (err: any) {
      console.error("Update error:", err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Handover Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-purple-200 backdrop-blur-sm">
            <Layers className="w-3.5 h-3.5 text-purple-300" />
            <span>Developer Handover Hub & Admin Architecture</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Admin Module Foundation & Handover Spec
          </h1>

          <p className="text-xs sm:text-sm text-indigo-200 max-w-3xl leading-relaxed">
            The foundation and Student Module are complete. This page documents the backend architecture, Supabase schema contracts, and pre-built service functions ready for the incoming developer to implement the full Admin Portal.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-200 border border-purple-400/30">
              Role: &apos;admin&apos;
            </span>
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
              RLS Policies Ready
            </span>
            <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-200 border border-blue-400/30">
              updateComplaintStatus() Ready
            </span>
          </div>
        </div>
      </div>

      {/* Developer Architectural Blueprint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">1. Database & Schema</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Supabase schema is written in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">supabase/schema.sql</code>. It includes <code className="font-mono">profiles</code> (role: student | admin), <code className="font-mono">complaints</code>, <code className="font-mono">complaint_timeline</code>, and auto-generated ticket IDs.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">2. Supabase RLS Policies</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Row Level Security policies allow Admins to read all complaints and update status, admin remarks, and technician assignment fields, while students can only manage their own tickets.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCode2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">3. Service Contracts</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            The service <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">src/lib/services/complaintService.ts</code> already provides <code className="font-mono">updateComplaintStatus()</code>, handling both Supabase and offline localStorage fallback.
          </p>
        </div>
      </div>

      {/* Interactive Admin Dispatch Tester */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-xs font-bold text-purple-700 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Live Interactive Preview</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Admin Remarks & Status Dispatch Console
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming developers or reviewers can use this working controller to test updating complaint statuses and writing admin remarks in real-time.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Ticket Selector List */}
          <div className="lg:col-span-5 space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Ticket to Review
            </label>
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {complaints.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-purple-50/80 border-purple-600 shadow-sm ring-2 ring-purple-500/20"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-indigo-700">#{c.ticketId}</span>
                      <StatusBadge status={c.status} size="sm" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{c.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{c.building}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Update Form */}
          <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">
            {selectedComplaint ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Updating Ticket</span>
                    <h3 className="font-mono text-base font-extrabold text-indigo-900">
                      #{selectedComplaint.ticketId}
                    </h3>
                  </div>
                  <PriorityBadge priority={selectedComplaint.priority} />
                </div>

                {/* Status Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Update Complaint Status
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Submitted", "In Progress", "Resolved"] as ComplaintStatus[]).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setNewStatus(st)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          newStatus === st
                            ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Assigned Technician */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Assigned Maintenance Unit / Technician
                  </label>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    placeholder="e.g. En. Hafiz (CoolTech HVAC) or Rapid Plumbing Unit"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 bg-white"
                  />
                </div>

                {/* Admin Remarks */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Official Admin Remarks (Visible to Student)
                  </label>
                  <textarea
                    rows={3}
                    value={adminRemarks}
                    onChange={(e) => setAdminRemarks(e.target.value)}
                    placeholder="Enter technician dispatch notes, inspection findings, parts ordered, or completion notes..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 bg-white leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Link
                    href={`/complaints/${selectedComplaint.ticketId}`}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                    target="_blank"
                  >
                    View in Student Tracker →
                  </Link>

                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md transition-all disabled:opacity-50"
                  >
                    {updating ? "Saving Changes..." : "Save Admin Remarks & Status"}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-slate-500 text-center py-10">Select a complaint to update.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
