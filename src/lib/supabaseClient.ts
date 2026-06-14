import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-supabase-project") &&
    !supabaseAnonKey.includes("your-supabase-anon-key")
  );
};

if (!isSupabaseConfigured()) {
  console.warn(
    "Supabase credentials are not configured or are using placeholders. " +
    "Please update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. " +
    "Falling back to local storage for testing ease."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
