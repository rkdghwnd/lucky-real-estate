import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { getAdminAccess, type AdminAccess } from '@/lib/admin/auth';
import { AdminHeader } from '@/components/admin/AdminHeader';

// Client-side admin guard (replaces the old server (protected)/layout.tsx).
// getAdminAccess checks the Supabase session + is_admin() RPC. RLS is the real
// enforcement; this just gates the UI.
export function AdminLayout() {
  const [status, setStatus] = useState<'checking' | 'authed' | 'denied'>('checking');
  const [admin, setAdmin] = useState<AdminAccess | null>(null);

  useEffect(() => {
    let active = true;
    getAdminAccess(supabase).then(access => {
      if (!active) return;
      setAdmin(access);
      setStatus(access ? 'authed' : 'denied');
    });
    return () => {
      active = false;
    };
  }, []);

  if (status === 'checking') {
    return <div className="grid min-h-[100dvh] place-items-center bg-[#f5f7fa] text-muted">확인 중…</div>;
  }
  if (status === 'denied' || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-[100dvh] bg-[#f5f7fa] text-ink">
      <AdminHeader email={admin.email} />
      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
