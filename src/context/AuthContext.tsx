"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserRole } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    studentId: string;
    email: string;
    password: string;
  }) => Promise<{
    success: boolean;
    error?: string;
    requiresEmailConfirmation?: boolean;
    message?: string;
  }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to fetch user profile from public.profiles table
  const fetchProfile = async (
    userId: string,
    userEmail: string,
    metadata?: Record<string, any>
  ): Promise<UserProfile> => {
    const supabase = getSupabaseClient();

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error && profile) {
        return {
          id: profile.id,
          email: profile.email || userEmail,
          fullName:
            profile.full_name ||
            metadata?.full_name ||
            userEmail.split("@")[0] ||
            "Student",
          studentId: profile.student_id || metadata?.student_id || "",
          role: profile.role || "student",
          department: profile.department || metadata?.department || "",
          phone: profile.phone || metadata?.phone || "",
          avatarUrl: profile.avatar_url || "",
          createdAt: profile.created_at,
        };
      }
    } catch (err) {
      console.warn("Could not query public.profiles table:", err);
    }

    // Fallback if profile row is not yet created by database trigger
    const fullName =
      metadata?.full_name || userEmail.split("@")[0] || "Student";
    const studentId = metadata?.student_id || "";

    // Attempt to upsert profile into public.profiles
    try {
      await supabase.from("profiles").upsert(
        {
          id: userId,
          email: userEmail,
          full_name: fullName,
          student_id: studentId,
          role: "student",
        },
        { onConflict: "id" }
      );
    } catch (e) {
      // Ignored if RLS or database trigger already handles it
    }

    return {
      id: userId,
      email: userEmail,
      fullName,
      studentId,
      role: "student",
      department: metadata?.department || "",
      phone: metadata?.phone || "",
    };
  };

  // Initialize session and subscribe to Supabase Auth state changes
  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    const initialize = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && mounted) {
          const profile = await fetchProfile(
            session.user.id,
            session.user.email || "",
            session.user.user_metadata
          );
          if (mounted) {
            setUser(profile);
          }
        } else if (mounted) {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth session load error:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initialize();

    // Listen to real-time auth state events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        setIsLoading(false);
      } else if (session?.user) {
        const profile = await fetchProfile(
          session.user.id,
          session.user.email || "",
          session.user.user_metadata
        );
        if (mounted) {
          setUser(profile);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Supabase Auth Login
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setIsLoading(false);
        // User-friendly handling for unconfirmed emails
        if (
          error.message.toLowerCase().includes("email not confirmed") ||
          error.message.toLowerCase().includes("confirm your email")
        ) {
          return {
            success: false,
            error:
              "Email confirmation required. Please check your inbox and verify your email before logging in.",
          };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        const profile = await fetchProfile(
          data.user.id,
          data.user.email || email,
          data.user.user_metadata
        );
        setUser(profile);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "Failed to retrieve user session." };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || "An unexpected error occurred during login.",
      };
    }
  };

  // Supabase Auth Registration
  const register = async (data: {
    fullName: string;
    studentId: string;
    email: string;
    password: string;
  }): Promise<{
    success: boolean;
    error?: string;
    requiresEmailConfirmation?: boolean;
    message?: string;
  }> => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim(),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName.trim(),
            student_id: data.studentId.trim(),
            role: "student",
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      // Check if immediate session was returned or if email confirmation is required
      if (authData.session && authData.user) {
        const profile = await fetchProfile(
          authData.user.id,
          authData.user.email || data.email,
          authData.user.user_metadata
        );
        setUser(profile);
        setIsLoading(false);
        return { success: true };
      }

      // If session is null, Supabase requires email verification
      setIsLoading(false);
      return {
        success: true,
        requiresEmailConfirmation: true,
        message:
          "Account created successfully! Please check your email inbox to confirm your email before signing in.",
      };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || "Registration failed. Please try again.",
      };
    }
  };

  // Real Supabase Sign Out
  const logout = async () => {
    setIsLoading(true);
    const supabase = getSupabaseClient();
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const profile = await fetchProfile(user.id, user.email);
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "student",
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
