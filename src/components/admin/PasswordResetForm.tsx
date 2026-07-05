'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { updatePasswordAction, type AdminActionResult } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';

type ResetAction = (form: FormData) => Promise<AdminActionResult>;

export function PasswordResetForm({ action = updatePasswordAction }: { action?: ResetAction }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    const result = await action(new FormData(event.currentTarget));
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.replace('/admin/login?password=updated');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
      <div>
        <label htmlFor="new-password" className="mb-2 block text-sm font-bold text-ink">새 비밀번호</label>
        <input id="new-password" name="password" type="password" minLength={10} autoComplete="new-password" required className="h-12 w-full rounded-md border border-hairline px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </div>
      <div>
        <label htmlFor="confirm-password" className="mb-2 block text-sm font-bold text-ink">새 비밀번호 확인</label>
        <input id="confirm-password" name="confirmPassword" type="password" minLength={10} autoComplete="new-password" required className="h-12 w-full rounded-md border border-hairline px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>{pending ? '변경 중…' : '비밀번호 변경'}</Button>
    </form>
  );
}
