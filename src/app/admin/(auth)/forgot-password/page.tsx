import Link from 'next/link';
import { PasswordRecoveryForm } from '@/components/admin/PasswordRecoveryForm';

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-[100dvh] place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-hairline bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.10)]">
        <h1 className="text-2xl font-extrabold">비밀번호 재설정</h1>
        <p className="mb-7 mt-2 text-sm text-muted">관리자 이메일로 재설정 링크를 보냅니다.</p>
        <PasswordRecoveryForm />
        <Link href="/admin/login" className="mt-6 block text-center text-sm font-semibold text-brand">로그인으로 돌아가기</Link>
      </section>
    </div>
  );
}
