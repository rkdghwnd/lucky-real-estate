import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm';
import { getAdminAccess } from '@/lib/admin/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AdminLoginPage() {
  const client = await createServerSupabaseClient();
  if (await getAdminAccess(client)) redirect('/admin');

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-hairline bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.10)]">
        <Link href="/" className="mb-7 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-md bg-brand text-xl font-extrabold text-white">행</span>
          <span><strong className="block text-xl">행운부동산</strong><span className="text-sm text-muted">매물 관리자</span></span>
        </Link>
        <h1 className="mb-2 text-2xl font-extrabold">관리자 로그인</h1>
        <p className="mb-7 text-sm text-muted">등록된 관리자 계정으로 로그인해주세요.</p>
        <LoginForm />
      </section>
    </div>
  );
}
