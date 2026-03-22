import { createClient } from "@supabase/supabase-js";

// Admin client with service_role key — server-side only!
// Auto-refresh and session persistence disabled because service_role
// bypasses RLS and should never maintain a long-lived session.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SERVICE_ROLE_KEY environment variables");
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
