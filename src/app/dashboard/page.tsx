"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  PlusCircle,
  ClipboardList,
  Search,
  Sparkles,
  ArrowRight,
  PhoneCall,
  RotateCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Complaint, ComplaintStats } from "@/types";
import { getComplaints, getComplaintStats } from "@/lib/services/complaintService";
import { StatsCard } from "@/components/student/StatsCard";
import { ComplaintCard } from "@/components/student/ComplaintCard";
import { COMPLAINT_CATEGORIES } from "@/lib/constants";

export default function StudentDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<ComplaintStats>({
    total: 0,
    submitted: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Authentication guard: prevent opening dashboard without authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [fetchedStats, fetchedComplaints] = await Promise.all([
        getComplaintStats(user.id),
        getComplaints(user.id),
      ]);
      setStats(fetchedStats);
      setComplaints(fetchedComplaints);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Loading state while checking authentication
  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Filter complaints for recent list
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.roomFloor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || c.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* 1. Welcome Section - Dynamically displays real user's name */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-purple-200 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Student Self-Service Portal</span>
            </div>
            {/* Dynamic Full Name from active user session / database */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl leading-relaxed">
              Track maintenance status, report faulty campus facilities, and receive real-time repair updates from the campus estate division.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-indigo-300 pt-1 font-mono">
              {user.studentId && <span>ID: {user.studentId}</span>}
              {user.department && (
                <>
                  <span>•</span>
                  <span>{user.department}</span>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadDashboardData}
              title="Refresh Data"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-sm border border-white/10"
            >
              <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              href="/complaints/submit"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-indigo-950 bg-white hover:bg-indigo-50 shadow-lg shadow-black/20 hover:scale-105 transition-all duration-200"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Submit Complaint</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Stats Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Complaint Overview
          </h2>
          <span className="text-xs text-slate-500">Live Maintenance Analytics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Total Complaints */}
          <StatsCard
            title="Total Complaints"
            value={stats.total}
            icon={FileText}
            description="All tickets submitted by you"
            gradient="from-indigo-600 to-purple-600"
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            borderColor="border-indigo-100"
          />

          {/* Submitted */}
          <StatsCard
            title="Submitted"
            value={stats.submitted}
            icon={Clock}
            description="Pending admin queue review"
            gradient="from-amber-500 to-orange-500"
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            borderColor="border-amber-100"
          />

          {/* In Progress */}
          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            icon={Wrench}
            description="Technician actively repairing"
            gradient="from-blue-600 to-cyan-500"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            borderColor="border-blue-100"
          />

          {/* Resolved */}
          <StatsCard
            title="Resolved"
            value={stats.resolved}
            icon={CheckCircle2}
            description="Inspection complete & closed"
            gradient="from-emerald-600 to-teal-500"
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            borderColor="border-emerald-100"
          />
        </div>
      </div>

      {/* 3. Recent Complaints Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Complaints</h2>
            <p className="text-xs text-slate-500">
              Track the current status and technician updates on your reported issues.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/complaints"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-xl transition-colors"
            >
              <span>View All Complaints ({stats.total})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket #, title, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                selectedCategory === "All"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Categories
            </button>
            {COMPLAINT_CATEGORIES.slice(0, 4).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                  selectedCategory === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Complaints Grid */}
        {loading ? (
          <div className="py-16 text-center">
            <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No complaints found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "All"
                ? "No complaints match your current filter criteria."
                : "You haven't reported any maintenance issues yet. Keep your campus clean and functional!"}
            </p>
            <div className="mt-4">
              <Link
                href="/complaints/submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit First Complaint</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredComplaints.slice(0, 6).map((item) => (
              <ComplaintCard key={item.id} complaint={item} />
            ))}
          </div>
        )}
      </div>

      {/* 4. Campus Maintenance Quick Hotline Info Card */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Emergency Maintenance Assistance</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Experiencing an immediate electrical hazard, pipe burst, or safety emergency? Contact the 24/7 Security & Maintenance Control Centre directly at{" "}
              <span className="font-mono font-bold text-indigo-700">+60 3-8999 1999</span>.
            </p>
          </div>
        </div>

        <Link
          href="/complaints/submit"
          className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-colors"
        >
          Lodge Urgent Report
        </Link>
      </div>
    </div>
  );
}
