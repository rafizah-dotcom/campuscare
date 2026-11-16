import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Creates a server-side Supabase client instance.
 * Returns null if Supabase environment variables are missing.
 */
export const createServerSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
};
