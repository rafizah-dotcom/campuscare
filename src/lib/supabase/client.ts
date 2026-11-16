import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

/**
 * Checks whether valid Supabase environment variables are present.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.trim().length > 0 &&
    supabaseUrl.startsWith("http") &&
    typeof supabasePublishableKey === "string" &&
    supabasePublishableKey.trim().length > 0
  );
};

let clientInstance: SupabaseClient | null = null;

/**
 * Returns a singleton browser Supabase client.
 */
export const getSupabaseClient = (): SupabaseClient => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return clientInstance;
};
