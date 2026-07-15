import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  throw new Error('Supabase env vars (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) are missing');
}

// Single browser client for the whole SPA: public reads (RLS lets anon read
// status='공개') and the admin session (persisted; RLS gates writes via is_admin()).
export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

// Back-compat shim for admin components pending the 2g rewrite.
export function createBrowserSupabaseClient() {
  return supabase;
}
