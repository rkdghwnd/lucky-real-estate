import type { SupabaseClient } from '@supabase/supabase-js';

export interface AdminAccess {
  userId: string;
  email: string;
}

export async function getAdminAccess(client: SupabaseClient): Promise<AdminAccess | null> {
  const { data, error } = await client.auth.getClaims();
  const claims = data?.claims;
  const sub = claims?.sub;
  if (error || typeof sub !== 'string') return null;

  const { data: allowed, error: adminError } = await client.rpc('is_admin');
  if (adminError || allowed !== true) return null;

  const email = claims?.email;
  return { userId: sub, email: typeof email === 'string' ? email : '' };
}
