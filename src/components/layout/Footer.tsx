"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, PhoneCall, Mail, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const Footer: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // On Login and Register pages: do NOT show student navigation
  if (isAuthPage) {
    return (
      <footer className="w-full bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <p>© {new Date().getFullYear()} {APP_NAME}. {APP_TAGLINE}</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">{APP_NAME}</span>
            </div>
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              {APP_TAGLINE}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Cloud-based campus facilities maintenance and incident tracking system designed to streamline student complaint reporting and resolution.
            </p>
          </div>

          {/* Quick Links (Only visible when authenticated) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Student Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/complaints/submit" className="hover:text-indigo-400 transition-colors">
                  Submit Complaint
                </Link>
              </li>
              <li>
                <Link href="/complaints" className="hover:text-indigo-400 transition-colors">
                  Track Complaints
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-indigo-400 transition-colors">
                  Admin Module Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency & Facilities Hotline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Campus Facilities Hotline
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>24/7 Control Room: +60 3-8999 1999</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                <span>facilities@campuscare.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Estates & Asset Directorate, Level 1</span>
              </li>
            </ul>
          </div>

          {/* Tech Stack Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Cloud Infrastructure
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="px-2 py-1 rounded bg-slate-800 text-blue-400 border border-slate-700">
                Next.js 15
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                TypeScript
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-purple-400 border border-slate-700">
                Tailwind CSS
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                Supabase
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-sky-400 border border-slate-700">
                PostgreSQL
              </span>
              <span className="px-2 py-1 rounded bg-slate-800 text-pink-400 border border-slate-700">
                Vercel Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Engineered with clean modularity for student reporting & future admin maintenance dispatch.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with modern blue & purple theme for student facility excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};
