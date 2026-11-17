"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ShieldCheck,
  CheckCircle2,
  FileCode2,
  Database,
  Layers,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { Complaint, ComplaintStatus } from "@/types";

import {
  getAllComplaints,
  updateComplaintStatus,
} from "@/lib/services/complaintService";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";

export default function AdminPage() {
  const router = useRouter();

  const {
    user,
    role,
    isLoading,
  } = useAuth();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] =
    useState<Complaint | null>(null);

  const [newStatus, setNewStatus] =
    useState<ComplaintStatus>("In Progress");

  const [adminRemarks, setAdminRemarks] =
    useState("");

  const [assignedTo, setAssignedTo] =
    useState("");

  const [updating, setUpdating] =
    useState(false);

  const [loadingComplaints, setLoadingComplaints] =
    useState(false);

  const [successMsg, setSuccessMsg] =
    useState("");

  const [errorMsg, setErrorMsg] =
    useState("");

  /**
   * ADMIN ONLY:
   * Load every complaint from Supabase.
   */
  const loadComplaints = async (): Promise<Complaint[]> => {
    try {
      setLoadingComplaints(true);
      setErrorMsg("");

      const list =
        await getAllComplaints();

      setComplaints(list);

      return list;
    } catch (error: any) {
      console.error(
        "Unable to load admin complaints:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Unable to load complaints."
      );

      return [];
    } finally {
      setLoadingComplaints(false);
    }
  };

  /**
   * Protect /admin.
   *
   * Logged out:
   * /admin -> /login
   *
   * Student:
   * /admin -> /dashboard
   *
   * Admin:
   * allowed to continue.
   */
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    const initialiseAdminPage =
      async () => {
        const list =
          await loadComplaints();

        if (list.length > 0) {
          const firstComplaint =
            list[0];

          setSelectedComplaint(
            firstComplaint
          );

          setNewStatus(
            firstComplaint.status
          );

          setAdminRemarks(
            firstComplaint.adminRemarks ||
              firstComplaint.adminRemark ||
              ""
          );

          setAssignedTo(
            firstComplaint.assignedTo ||
              ""
          );
        }
      };

    initialiseAdminPage();
  }, [
    user,
    role,
    isLoading,
    router,
  ]);

  /**
   * Select complaint from list.
   */
  const handleSelect = (
    complaint: Complaint
  ) => {
    setSelectedComplaint(
      complaint
    );

    setNewStatus(
      complaint.status
    );

    setAdminRemarks(
      complaint.adminRemarks ||
        complaint.adminRemark ||
        ""
    );

    setAssignedTo(
      complaint.assignedTo ||
        ""
    );

    setSuccessMsg("");
    setErrorMsg("");
  };

  /**
   * Save Admin changes.
   */
  const handleUpdate = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!selectedComplaint) {
      return;
    }

    setUpdating(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const updated =
        await updateComplaintStatus(
          selectedComplaint.id,
          newStatus,
          adminRemarks,
          assignedTo,
          user?.fullName ||
            "Facilities Admin"
        );

      if (!updated) {
        setErrorMsg(
          "The complaint could not be updated."
        );

        return;
      }

      setSuccessMsg(
        `Successfully updated ticket #${updated.ticketId} to "${newStatus}".`
      );

      /**
       * Refresh complaint list
       * after successful update.
       */
      const refreshedList =
        await loadComplaints();

      const refreshedComplaint =
        refreshedList.find(
          (complaint) =>
            complaint.id ===
            updated.id
        ) || updated;

      setSelectedComplaint(
        refreshedComplaint
      );

      setNewStatus(
        refreshedComplaint.status
      );

      setAdminRemarks(
        refreshedComplaint.adminRemarks ||
          refreshedComplaint.adminRemark ||
          ""
      );

      setAssignedTo(
        refreshedComplaint.assignedTo ||
          ""
      );
    } catch (error: any) {
      console.error(
        "Admin update error:",
        error
      );

      setErrorMsg(
        error?.message ||
          "Unable to update complaint."
      );
    } finally {
      setUpdating(false);
    }
  };

  /**
   * While Supabase AuthContext
   * is checking the active session.
   */
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />

          <p className="text-sm font-medium text-slate-500">
            Checking administrator access...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Do not render Admin content
   * while redirecting an unauthorised user.
   */
  if (!user || role !== "admin") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-sm text-slate-500">
          Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">

      {/* ========================= */}
      {/* ADMIN HERO */}
      {/* ========================= */}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">

        <div className="relative z-10 space-y-3">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-purple-200 backdrop-blur-sm">

            <Layers className="w-3.5 h-3.5 text-purple-300" />

            <span>
              Campus Facilities Administration Portal
            </span>

          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">

            CampusCare Admin Dashboard

          </h1>

          <p className="text-xs sm:text-sm text-indigo-200 max-w-3xl leading-relaxed">

            Monitor campus maintenance complaints,
            assign maintenance personnel, update repair
            status, and provide resolution remarks to
            students.

          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">

            <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-200 border border-purple-400/30">

              Administrator Access

            </span>

            <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">

              Supabase Secured

            </span>

            <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-200 border border-blue-400/30">

              Live Complaint Management

            </span>

          </div>

        </div>

      </div>

      {/* ========================= */}
      {/* ADMIN INFORMATION CARDS */}
      {/* ========================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Complaint Database */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">

          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">

            <Database className="w-5 h-5" />

          </div>

          <h3 className="text-base font-bold text-slate-900">

            Complaint Database

          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">

            View maintenance complaints submitted
            by students and monitor their current
            repair status from one central portal.

          </p>

        </div>

        {/* Secure Access */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">

          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">

            <ShieldCheck className="w-5 h-5" />

          </div>

          <h3 className="text-base font-bold text-slate-900">

            Secure Role Access

          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">

            Administrator functions are protected
            using authenticated user roles and
            Supabase Row Level Security policies.

          </p>

        </div>

        {/* Workflow */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">

          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">

            <FileCode2 className="w-5 h-5" />

          </div>

          <h3 className="text-base font-bold text-slate-900">

            Maintenance Workflow

          </h3>

          <p className="text-xs text-slate-500 leading-relaxed">

            Assign maintenance personnel, update
            complaint progress, and communicate
            official remarks directly to students.

          </p>

        </div>

      </div>

      {/* ========================= */}
      {/* COMPLAINT MANAGEMENT */}
      {/* ========================= */}

      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">

        <div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-xs font-bold text-purple-700 mb-2">

            <Sparkles className="w-3.5 h-3.5 text-purple-600" />

            <span>
              Complaint Management
            </span>

          </div>

          <h2 className="text-xl font-bold text-slate-900">

            Complaint Review & Status Management

          </h2>

          <p className="text-xs text-slate-500 mt-0.5">

            Review student complaints, assign
            maintenance personnel, update repair
            progress, and record official remarks.

          </p>

        </div>

        {/* SUCCESS MESSAGE */}

        {successMsg && (

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">

            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />

            <span>
              {successMsg}
            </span>

          </div>

        )}

        {/* ERROR MESSAGE */}

        {errorMsg && (

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">

            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />

            <span>
              {errorMsg}
            </span>

          </div>

        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ========================= */}
          {/* LEFT: COMPLAINT LIST */}
          {/* ========================= */}

          <div className="lg:col-span-5 space-y-2">

            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">

              Select Ticket to Review

            </label>

            {loadingComplaints ? (

              <div className="p-8 text-center rounded-2xl border border-slate-200 bg-slate-50">

                <p className="text-xs text-slate-500">
                  Loading complaints...
                </p>

              </div>

            ) : complaints.length === 0 ? (

              <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">

                <p className="text-sm font-semibold text-slate-700">
                  No complaints found
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Student complaints will appear here.
                </p>

              </div>

            ) : (

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">

                {complaints.map(
                  (complaint) => {

                    const isSelected =
                      selectedComplaint?.id ===
                      complaint.id;

                    return (

                      <button
                        key={complaint.id}
                        type="button"
                        onClick={() =>
                          handleSelect(
                            complaint
                          )
                        }
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                          isSelected
                            ? "bg-purple-50/80 border-purple-600 shadow-sm ring-2 ring-purple-500/20"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >

                        <div className="flex items-center justify-between text-xs mb-1">

                          <span className="font-mono font-bold text-indigo-700">

                            #{complaint.ticketId}

                          </span>

                          <StatusBadge
                            status={
                              complaint.status
                            }
                            size="sm"
                          />

                        </div>

                        <p className="text-xs font-bold text-slate-900 line-clamp-1">

                          {complaint.title}

                        </p>

                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">

                          {complaint.building}

                        </p>

                      </button>

                    );
                  }
                )}

              </div>

            )}

          </div>

          {/* ========================= */}
          {/* RIGHT: UPDATE FORM */}
          {/* ========================= */}

          <div className="lg:col-span-7 bg-slate-50 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4">

            {selectedComplaint ? (

              <form
                onSubmit={
                  handleUpdate
                }
                className="space-y-4"
              >

                {/* Ticket Header */}

                <div className="flex items-center justify-between pb-3 border-b border-slate-200">

                  <div>

                    <span className="text-[11px] font-bold text-slate-500 uppercase">

                      Updating Ticket

                    </span>

                    <h3 className="font-mono text-base font-extrabold text-indigo-900">

                      #{selectedComplaint.ticketId}

                    </h3>

                  </div>

                  <PriorityBadge
                    priority={
                      selectedComplaint.priority
                    }
                  />

                </div>

                {/* Status */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">

                    Update Complaint Status

                  </label>

                  <div className="grid grid-cols-3 gap-2">

                    {(
                      [
                        "Submitted",
                        "In Progress",
                        "Resolved",
                      ] as ComplaintStatus[]
                    ).map(
                      (status) => (

                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setNewStatus(
                              status
                            )
                          }
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                            newStatus ===
                            status
                              ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >

                          {status}

                        </button>

                      )
                    )}

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
                    onChange={(e) =>
                      setAssignedTo(
                        e.target.value
                      )
                    }
                    placeholder="e.g. Campus HVAC Maintenance Team"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 bg-white"
                  />

                </div>

                {/* Admin Remarks */}

                <div>

                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">

                    Official Admin Remarks
                    (Visible to Student)

                  </label>

                  <textarea
                    rows={3}
                    value={
                      adminRemarks
                    }
                    onChange={(e) =>
                      setAdminRemarks(
                        e.target.value
                      )
                    }
                    placeholder="Enter inspection findings, technician updates, parts ordered, or completion notes..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 bg-white leading-relaxed"
                  />

                </div>

                {/* Actions */}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">

                  <Link
                    href={`/complaints/${selectedComplaint.ticketId}`}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                    target="_blank"
                  >

                    View Complaint Details →

                  </Link>

                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-md transition-all disabled:opacity-50"
                  >

                    {updating
                      ? "Saving Changes..."
                      : "Save Admin Remarks & Status"}

                  </button>

                </div>

              </form>

            ) : (

              <p className="text-xs text-slate-500 text-center py-10">

                Select a complaint to update.

              </p>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}