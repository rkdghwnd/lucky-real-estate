import { redirect } from 'next/navigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { getAdminAccess } from '@/lib/admin/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const client = await createServerSupabaseClient();
  const admin = await getAdminAccess(client);
  if (!admin) redirect('/admin/login');

  return (
    <>
      <AdminHeader email={admin.email} />
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </>
  );
}
