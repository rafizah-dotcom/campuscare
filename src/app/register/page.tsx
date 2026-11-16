"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  Hash,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessInfo(null);

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (!studentId.trim()) {
      setErrorMsg("Please enter your Student ID.");
      return;
    }

    if (!email.trim()) {
      setErrorMsg("Please enter your campus email.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        fullName: fullName.trim(),
        studentId: studentId.trim(),
        email: email.trim(),
        password,
      });

      if (res.success) {
        if (res.requiresEmailConfirmation) {
          setSuccessInfo(
            res.message ||
              "Registration successful! Please check your email inbox to confirm your email before signing in."
          );
        } else {
          router.push("/dashboard");
        }
      } else {
        setErrorMsg(res.error || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Background Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-blue-600/10 via-indigo-600/15 to-purple-600/15 blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-1 text-xs text-purple-700 font-semibold uppercase tracking-wider">
            {APP_TAGLINE}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 p-6 sm:p-8">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Registration Successful!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {successInfo}
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    placeholder="e.g. Nur Fiza"
                  />
                </div>
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student ID
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    placeholder="e.g. STU1024"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    placeholder="student@campus.edu"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? "Registering with Supabase..." : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Link back to Login */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-indigo-600 hover:text-indigo-800"
          >
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
