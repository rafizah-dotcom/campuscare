"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  ShieldCheck,
  PlusCircle,
  LayoutDashboard,
  ClipboardList,
  Menu,
  X,
  LogOut,
  Database,
  Building,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    role,
    logout,
    isSupabaseMode,
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [
    profileDropdownOpen,
    setProfileDropdownOpen,
  ] = useState(false);

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register";

  const isAdmin = role === "admin";

  const homePath = isAdmin
    ? "/admin"
    : "/dashboard";

  const isActive = (path: string) => {
    if (
      path === "/dashboard" &&
      pathname === "/dashboard"
    ) {
      return true;
    }

    if (
      path === "/admin" &&
      pathname === "/admin"
    ) {
      return true;
    }

    if (
      path === "/complaints" &&
      (
        pathname === "/complaints" ||
        pathname.startsWith(
          "/complaints/CC-"
        )
      )
    ) {
      return true;
    }

    if (
      path === "/complaints/submit" &&
      pathname === "/complaints/submit"
    ) {
      return true;
    }

    return false;
  };

  const navLinks = isAdmin
    ? [
        {
          name: "Admin Dashboard",
          href: "/admin",
          icon: Building,
        },
      ]
    : [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          name: "Track Complaints",
          href: "/complaints",
          icon: ClipboardList,
        },
      ];

  const handleLogout = async () => {
    await logout();

    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);

    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-indigo-100 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* LOGO */}
          <Link
            href={
              !isAuthPage && user
                ? homePath
                : "/login"
            }
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">

              <ShieldCheck className="w-6 h-6 text-white" />

            </div>

            <div>

              <div className="flex items-center gap-2">

                <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  {APP_NAME}
                </span>

                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">

                  {isAdmin
                    ? "Admin Portal"
                    : "Student Portal"}

                </span>

              </div>

              <p className="text-[11px] font-medium text-slate-500 tracking-wide hidden sm:block">
                {APP_TAGLINE}
              </p>

            </div>
          </Link>

          {/* AUTH PAGES */}
          {isAuthPage ? (

            <div className="flex items-center gap-3">

              {pathname === "/login" ? (

                <Link
                  href="/register"
                  className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>

              ) : (

                <Link
                  href="/login"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl border border-indigo-100 transition-all"
                >
                  Sign In
                </Link>

              )}

            </div>

          ) : user ? (

            <>
              {/* DESKTOP NAVIGATION */}
              <nav className="hidden md:flex items-center gap-1.5">

                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active =
                    isActive(link.href);

                  return (

                    <Link
                      key={link.name}
                      href={link.href}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                        active
                          ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/80"
                          : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                      }`}
                    >

                      <Icon
                        className={`w-4 h-4 ${
                          active
                            ? "text-indigo-600"
                            : "text-slate-400"
                        }`}
                      />

                      {link.name}

                    </Link>

                  );
                })}

                {/* STUDENT ONLY */}
                {!isAdmin && (

                  <Link
                    href="/complaints/submit"
                    className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/35 hover:-translate-y-0.5"
                  >

                    <PlusCircle className="w-4 h-4" />

                    <span>
                      Submit Complaint
                    </span>

                  </Link>

                )}

              </nav>

              {/* RIGHT SIDE */}
              <div className="hidden md:flex items-center gap-3">

                {/* SUPABASE STATUS */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    isSupabaseMode
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                  title={
                    isSupabaseMode
                      ? "Connected to Supabase"
                      : "Backend connection unavailable"
                  }
                >

                  <Database className="w-3 h-3" />

                  <span>
                   Supabase Live
                  </span>

                </div>

                {/* PROFILE */}
                <div className="relative">

                  <button
                    type="button"
                    onClick={() =>
                      setProfileDropdownOpen(
                        !profileDropdownOpen
                      )
                    }
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-slate-200 hover:border-indigo-300 bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >

                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">

                      {user.fullName
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div className="text-left text-xs">

                      <p className="font-semibold text-slate-800 line-clamp-1 max-w-[120px]">
                        {user.fullName}
                      </p>

                      <p className="text-[10px] text-slate-400 capitalize">
                        {role}
                      </p>

                    </div>

                  </button>

                  {/* PROFILE DROPDOWN */}
                  {profileDropdownOpen && (

                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50"
                      onMouseLeave={() =>
                        setProfileDropdownOpen(
                          false
                        )
                      }
                    >

                      <div className="px-4 py-3 border-b border-slate-100">

                        <p className="text-xs font-bold text-slate-800">
                          {user.fullName}
                        </p>

                        <p className="text-[11px] text-slate-500">
                          {user.email}
                        </p>

                        {user.studentId && (

                          <p className="text-[11px] text-indigo-600 font-mono mt-0.5">

                            ID: {user.studentId}

                          </p>

                        )}

                        <span className="inline-flex mt-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">

                          {isAdmin
                            ? "Administrator"
                            : "Student"}

                        </span>

                      </div>

                      <div className="px-1 py-1">

                        {isAdmin && (

                          <Link
                            href="/admin"
                            onClick={() =>
                              setProfileDropdownOpen(
                                false
                              )
                            }
                            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-lg"
                          >

                            <Building className="w-4 h-4 text-purple-500" />

                            Admin Dashboard

                          </Link>

                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                        >

                          <LogOut className="w-4 h-4 text-rose-500" />

                          Sign Out

                        </button>

                      </div>

                    </div>

                  )}

                </div>

              </div>

              {/* MOBILE BUTTONS */}
              <div className="flex md:hidden items-center gap-2">

                {!isAdmin && (

                  <Link
                    href="/complaints/submit"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600"
                  >

                    <PlusCircle className="w-3.5 h-3.5" />

                    <span>
                      Report
                    </span>

                  </Link>

                )}

                <button
                  onClick={() =>
                    setMobileMenuOpen(
                      !mobileMenuOpen
                    )
                  }
                  className="p-2 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none"
                  aria-label="Toggle Navigation"
                >

                  {mobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}

                </button>

              </div>

            </>

          ) : (

            <div className="flex items-center gap-3">

              <Link
                href="/login"
                className="text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-xl shadow-sm transition-all"
              >
                Sign In
              </Link>

            </div>

          )}

        </div>
      </div>

      {/* MOBILE DRAWER */}
      {!isAuthPage &&
        user &&
        mobileMenuOpen && (

          <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">

              <div>

                <p className="text-sm font-bold text-slate-800">
                  {user.fullName}
                </p>

                <p className="text-xs text-slate-500">
                  {user.email}
                </p>

              </div>

              <span className="text-xs px-2 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">

                {role}

              </span>

            </div>

            <div className="space-y-1 pt-1">

              {navLinks.map((link) => {
                const Icon = link.icon;
                const active =
                  isActive(link.href);

                return (

                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() =>
                      setMobileMenuOpen(false)
                    }
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >

                    <Icon className="w-4 h-4 text-indigo-500" />

                    {link.name}

                  </Link>

                );
              })}

              {!isAdmin && (

                <Link
                  href="/complaints/submit"
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600"
                >

                  <PlusCircle className="w-4 h-4" />

                  Submit New Complaint

                </Link>

              )}

            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">

              <span className="text-xs text-slate-500">

                Supabase Live

              </span>

              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >

                <LogOut className="w-3.5 h-3.5" />

                Sign Out

              </button>

            </div>

          </div>

        )}

    </header>
  );
};