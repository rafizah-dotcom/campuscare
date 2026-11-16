"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserRole } from "@/types";
import { DEMO_ADMIN, MOCK_USER_FIZA } from "@/lib/mock-data";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isLoading: boolean;
  isSupabaseMode: boolean;
  login: (email: string, password?: string, requestedRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    studentId?: string;
    email: string;
    password?: string;
    role?: UserRole;
    department?: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = "campuscare_auth_session_user";
const REGISTERED_USERS_KEY = "campuscare_registered_users";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isSupabaseMode = isSupabaseConfigured();

  // Load session on startup: does NOT auto-login if no active session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isSupabaseMode) {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

              if (profile) {
                setUser({
                  id: profile.id,
                  email: profile.email,
                  fullName: profile.full_name,
                  role: profile.role,
                  studentId: profile.student_id,
                  department: profile.department,
                  phone: profile.phone,
                  avatarUrl: profile.avatar_url,
                  createdAt: profile.created_at,
                });
                setIsLoading(false);
                return;
              }
            }
          }
          // Supabase mode with no session
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Local storage mode: check if user previously logged in
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem(LOCAL_USER_KEY);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed && parsed.fullName) {
                setUser(parsed);
                setIsLoading(false);
                return;
              }
            } catch (e) {
              localStorage.removeItem(LOCAL_USER_KEY);
            }
          }
        }

        // Not logged in by default
        setUser(null);
      } catch (err) {
        console.error("Auth init error:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isSupabaseMode]);

  // Login handler
  const login = async (
    email: string,
    password?: string,
    requestedRole: UserRole = "student"
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseMode) {
      const supabase = getSupabaseClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profile) {
            const loggedInUser: UserProfile = {
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              role: profile.role,
              studentId: profile.student_id,
              department: profile.department,
              phone: profile.phone,
              avatarUrl: profile.avatar_url,
              createdAt: profile.created_at,
            };
            setUser(loggedInUser);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(loggedInUser));
            setIsLoading(false);
            return { success: true };
          }
        }
      }
    }

    // Local / Testing login
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user was registered locally
    if (typeof window !== "undefined") {
      const registeredRaw = localStorage.getItem(REGISTERED_USERS_KEY);
      if (registeredRaw) {
        try {
          const registeredUsers: (UserProfile & { password?: string })[] = JSON.parse(registeredRaw);
          const found = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
          if (found) {
            if (password && found.password && found.password !== password) {
              setIsLoading(false);
              return { success: false, error: "Incorrect password entered." };
            }

            const { password: _, ...userProfile } = found;
            setUser(userProfile);
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(userProfile));
            setIsLoading(false);
            return { success: true };
          }
        } catch (e) {
          console.error("Error reading registered users:", e);
        }
      }
    }

    // 2. Check if logging in as Fiza (temporary local mock user for testing)
    if (cleanEmail === "fiza@student.campus.edu" || cleanEmail.startsWith("fiza")) {
      setUser(MOCK_USER_FIZA);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(MOCK_USER_FIZA));
      setIsLoading(false);
      return { success: true };
    }

    // 3. Check if logging in as Admin
    if (requestedRole === "admin" || cleanEmail.includes("admin")) {
      setUser(DEMO_ADMIN);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(DEMO_ADMIN));
      setIsLoading(false);
      return { success: true };
    }

    // 4. Default dynamic local mock user for any entered email/name
    const namePart = email.split("@")[0] || "Student";
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const dynamicUser: UserProfile = {
      id: `usr_local_${Date.now()}`,
      email: email.trim(),
      fullName: displayName,
      role: requestedRole || "student",
      studentId: "STU" + Math.floor(1000 + Math.random() * 9000),
      department: "Faculty of Computing & Informatics",
      createdAt: new Date().toISOString(),
    };

    setUser(dynamicUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(dynamicUser));
    setIsLoading(false);
    return { success: true };
  };

  // Register handler
  const register = async (data: {
    fullName: string;
    studentId?: string;
    email: string;
    password?: string;
    role?: UserRole;
    department?: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    const userRole: UserRole = data.role || "student";

    if (isSupabaseMode) {
      const supabase = getSupabaseClient();
      if (supabase && data.password) {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              role: userRole,
              student_id: data.studentId,
              department: data.department,
              phone: data.phone,
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (authData.user) {
          const newUser: UserProfile = {
            id: authData.user.id,
            email: data.email,
            fullName: data.fullName,
            role: userRole,
            studentId: data.studentId,
            department: data.department,
            phone: data.phone,
            createdAt: new Date().toISOString(),
          };
          setUser(newUser);
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
          setIsLoading(false);
          return { success: true };
        }
      }
    }

    // Local registration
    const newUser: UserProfile & { password?: string } = {
      id: `usr_${Date.now()}`,
      email: data.email.trim(),
      fullName: data.fullName.trim(),
      role: userRole,
      studentId: data.studentId?.trim() || "STU" + Math.floor(1000 + Math.random() * 9000),
      department: data.department || "Faculty of Computing & Informatics",
      phone: data.phone || "",
      password: data.password,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      try {
        const registeredRaw = localStorage.getItem(REGISTERED_USERS_KEY);
        const registeredList = registeredRaw ? JSON.parse(registeredRaw) : [];
        registeredList.push(newUser);
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredList));
      } catch (e) {
        console.error("Error saving registered user locally:", e);
      }
    }

    const { password: _, ...sessionUser } = newUser;
    setUser(sessionUser);
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(sessionUser));
    setIsLoading(false);
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseMode) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_USER_KEY);
    }
  };

  const switchDemoRole = (newRole: UserRole) => {
    const targetUser = newRole === "admin" ? DEMO_ADMIN : MOCK_USER_FIZA;
    setUser(targetUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(targetUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "student",
        isLoading,
        isSupabaseMode,
        login,
        register,
        logout,
        switchDemoRole,
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
