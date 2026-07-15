import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';
import { getAdminAccess } from '@/lib/admin/auth';
import { LoginForm } from '@/components/admin/LoginForm';

export function AdminLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '매물 관리자 로그인';
    let active = true;
    // Already-authenticated admins skip the form.
    getAdminAccess(supabase).then(access => {
      if (active && access) navigate('/admin', { replace: true });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[#f5f7fa] px-4">
      <div className="w-full max-w-sm rounded-2xl border border-hairline bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid size-11 place-items-center rounded-xl bg-brand text-lg font-black text-white">행</div>
          <h1 className="text-xl font-black text-ink">매물 관리자</h1>
          <p className="mt-1 text-sm text-muted">관리자 계정으로 로그인해주세요.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
