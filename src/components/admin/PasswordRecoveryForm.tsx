'use client';

import { useState, type FormEvent } from 'react';
import { requestPasswordResetAction, type AdminActionResult } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';

type RecoveryAction = (form: FormData) => Promise<AdminActionResult>;

export function PasswordRecoveryForm({ action = requestPasswordResetAction }: { action?: RecoveryAction }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    setMessage('');
    const result = await action(new FormData(event.currentTarget));
    setPending(false);
    if (!result.ok) setError(result.message);
    else setMessage('비밀번호 재설정 메일을 보냈습니다. 이메일을 확인해주세요.');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
      {message ? <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{message}</p> : null}
      <div>
        <label htmlFor="recovery-email" className="mb-2 block text-sm font-bold text-ink">아이디(이메일)</label>
        <input id="recovery-email" name="email" type="email" autoComplete="username" required className="h-12 w-full rounded-md border border-hairline px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>{pending ? '보내는 중…' : '재설정 메일 보내기'}</Button>
    </form>
  );
}
