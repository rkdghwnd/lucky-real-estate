import { PasswordResetForm } from '@/components/admin/PasswordResetForm';

export default function ResetPasswordPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-hairline bg-white p-8 shadow-[0_16px_45px_rgba(15,23,42,0.10)]">
        <h1 className="text-2xl font-extrabold">새 비밀번호 설정</h1>
        <p className="mb-7 mt-2 text-sm text-muted">10자 이상의 새 비밀번호를 입력해주세요.</p>
        <PasswordResetForm />
      </section>
    </div>
  );
}
