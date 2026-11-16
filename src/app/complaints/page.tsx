"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  PlusCircle,
  ClipboardList,
  Calendar,
  MapPin,
  ArrowRight,
  RotateCw,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Complaint, ComplaintStatus } from "@/types";
import { getComplaints } from "@/lib/services/complaintService";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityBadge } from "@/components/ui/PriorityBadge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { COMPLAINT_CATEGORIES } from "@/lib/constants";

export default function ComplaintsListPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Authentication guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getComplaints(user.id);
      setComplaints(data);
    } catch (err) {
      console.error("Error loading complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Filter & sort logic
  const filtered = complaints
    .filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.roomFloor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.adminRemarks && c.adminRemarks.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "All" || c.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All" || c.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const statuses: ("All" | ComplaintStatus)[] = [
    "All",
    "Submitted",
    "In Progress",
    "Resolved",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
            <ClipboardList className="w-3.5 h-3.5 text-indigo-600" />
            <span>Facility Status Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Track Complaints
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time status, technician assignments, and admin resolution remarks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/complaints/submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit New</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3">
        {/* Status Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {statuses.map((st) => {
            const count =
              st === "All"
                ? complaints.length
                : complaints.filter((c) => c.status === st).length;
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl font-bold shrink-0 transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : "bg-white text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Category & Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Ticket # (e.g. CC-2026-1048), title, building or remark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div className="md:col-span-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
            >
              <option value="All">All Maintenance Categories</option>
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Complaints List / Table */}
      {loading ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
          <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading complaint tickets...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No matching tickets found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or filter selection.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left col: Ticket, Status, Title, Meta */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
                      #{item.ticketId}
                    </span>
                    <StatusBadge status={item.status} size="sm" />
                    <PriorityBadge priority={item.priority} />
                    <span className="text-xs text-purple-700 font-semibold flex items-center gap-1 ml-1">
                      <CategoryIcon category={item.category} className="w-3.5 h-3.5" />
                      {item.category}
                    </span>
                  </div>

                  <Link
                    href={`/complaints/${item.ticketId}`}
                    className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                  >
                    {item.title}
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="font-medium text-slate-700">{item.building}</span>
                      <span>({item.roomFloor})</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right col: Admin Remarks & Track CTA */}
                <div className="lg:w-80 shrink-0 flex flex-col justify-between pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-6 border-slate-100">
                  {item.adminRemarks ? (
                    <div className="bg-purple-50/80 border border-purple-100 rounded-xl p-3 text-xs mb-3">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-purple-900 mb-0.5">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                        <span>Admin Remarks:</span>
                      </div>
                      <p className="text-purple-800 line-clamp-2 text-[11px]">
                        {item.adminRemarks}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic mb-3">
                      Awaiting facility supervisor review...
                    </div>
                  )}

                  <Link
                    href={`/complaints/${item.ticketId}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    <span>Track Full Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
