"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Building,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  FileText,
  RotateCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ComplaintCategory, ComplaintPriority, SubmitComplaintInput } from "@/types";
import { CAMPUS_BUILDINGS, COMPLAINT_CATEGORIES } from "@/lib/constants";
import { createComplaint, uploadComplaintPhoto } from "@/lib/services/complaintService";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export default function SubmitComplaintPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("Electrical");
  const [priority, setPriority] = useState<ComplaintPriority>("Medium");
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0]);
  const [roomFloor, setRoomFloor] = useState("");
  const [locationDetails, setLocationDetails] = useState("");
  const [description, setDescription] = useState("");

  // Photo upload states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Submission states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Handle file select
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("Image file size must be less than 8MB.");
      return;
    }

    setErrorMessage("");
    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!user) {
      setErrorMessage("You must be logged in to submit a complaint.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Please provide a brief title for the maintenance complaint.");
      return;
    }

    if (!roomFloor.trim()) {
      setErrorMessage("Please specify the exact room, floor, or lab number.");
      return;
    }

    if (description.trim().length < 15) {
      setErrorMessage("Please provide a more descriptive explanation (at least 15 characters).");
      return;
    }

    setSubmitting(true);

    try {
      let uploadedPhotoUrl: string | undefined = undefined;

      if (photoFile) {
        uploadedPhotoUrl = await uploadComplaintPhoto(photoFile);
      }

     const input: SubmitComplaintInput = {
  title: title.trim(),
  category,
  priority,

  location: [
    building.trim(),
    roomFloor.trim(),
    locationDetails.trim(),
  ]
    .filter(Boolean)
    .join(", "),

  building: building.trim(),
  roomFloor: roomFloor.trim(),
  locationDetails: locationDetails.trim() || undefined,

  description: description.trim(),
  photoPath: uploadedPhotoUrl,
};

const result = await createComplaint(
  input,
  user.id
);
      setSubmittedTicketId(result.ticketId);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage(err.message || "Failed to submit complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb / Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Facilities Incident Reporting</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit Maintenance Complaint
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Provide accurate details and a photo of the defect to expedite technician triage and on-site dispatch.
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Please check your submission:</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Complaint Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs flex items-center justify-center font-bold">
              1
            </span>
            Complaint Overview
          </h2>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Complaint Subject / Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Water leak from ceiling cassette in Lab 302"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium"
            />
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {COMPLAINT_CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center text-center p-3 rounded-2xl border text-xs font-semibold transition-all duration-150 ${
                      isSelected
                        ? "bg-indigo-50/80 border-indigo-600 text-indigo-700 shadow-sm ring-2 ring-indigo-500/20"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <CategoryIcon category={cat.id} className="w-4 h-4" />
                    </div>
                    <span className="line-clamp-1">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Severity / Priority
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["Low", "Medium", "High", "Emergency"] as ComplaintPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? p === "Emergency"
                          ? "bg-rose-600 border-rose-600 text-white shadow-sm"
                          : p === "High"
                          ? "bg-orange-600 border-orange-600 text-white shadow-sm"
                          : "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {p} {p === "Emergency" && "⚠️"}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Mark as Emergency only if there is immediate risk to student health, structural safety, or active hazard.
            </p>
          </div>
        </div>

        {/* Section 2: Location Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
              2
            </span>
            Campus Location Details
          </h2>

          {/* Building */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Campus Building / Faculty Complex <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
              >
                {CAMPUS_BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Room / Floor & Specific landmarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Room / Floor / Lab Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={roomFloor}
                  onChange={(e) => setRoomFloor(e.target.value)}
                  placeholder="e.g. Level 2, Room 204 or Lab 3B"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exact Landmark / Position (Optional)
              </label>
              <input
                type="text"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="e.g. Near the north stairwell fire exit"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Description & Photo Attachment */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs flex items-center justify-center font-bold">
              3
            </span>
            Description & Photo Evidence
          </h2>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {description.length} characters (min 15)
              </span>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is damaged, when the issue started, and any symptoms (e.g. sparks, dripping water, foul smell, strange sounds)..."
              className="w-full p-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 leading-relaxed"
            />
          </div>

          {/* Photo Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Attach Defect Photo
            </label>

            {!photoPreview ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50/50"
                    : "border-slate-300 hover:border-indigo-400 bg-slate-50/50"
                }`}
              >
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  className="sr-only"
                />

                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer font-bold text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Click to upload photo
                </label>
                <span className="text-slate-500 text-xs"> or drag and drop</span>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PNG, JPG, WebP up to 8MB. Stored securely in Supabase Storage.
                </p>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-3 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-36 h-28 rounded-xl overflow-hidden bg-slate-200 shrink-0 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Complaint Evidence Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 text-xs">
                  <p className="font-bold text-slate-800 line-clamp-1">{photoFile?.name}</p>
                  <p className="text-slate-400 mt-0.5">
                    {photoFile ? (photoFile.size / (1024 * 1024)).toFixed(2) + " MB" : ""}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-2 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Photo attached and ready for upload
                  </span>
                </div>

                <button
                  type="button"
                  onClick={removePhoto}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Remove Photo"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors text-center"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Registering Complaint...</span>
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* SUCCESS MODAL DIALOG */}
      {submittedTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Complaint Lodged Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your maintenance report has been routed to the campus facilities maintenance unit.
              </p>
            </div>

            {/* Generated Ticket Box */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                Official Tracking Ticket ID
              </span>
              <span className="font-mono text-2xl font-black text-indigo-900 tracking-tight mt-0.5 block">
                #{submittedTicketId}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              You can track technician inspection notes and resolution status in real-time.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/dashboard"
                className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href={`/complaints/${submittedTicketId}`}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-sm inline-flex items-center justify-center gap-1"
              >
                <span>Track Ticket</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
