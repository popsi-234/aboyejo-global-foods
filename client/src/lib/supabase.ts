// Aboyejo Global Foods uses the generated production schema contract for every Supabase query.
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const hasSupabaseConfig = Boolean(url && publishableKey);

export const supabase = createClient<Database>(
  url ?? "https://configuration-required.supabase.co",
  publishableKey ?? "configuration-required",
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  },
);
