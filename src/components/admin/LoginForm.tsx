'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Button } from 'antd';
import { loginAction, type AdminActionResult } from '@/app/admin/actions';

type LoginAction = (form: FormData) => Promise<AdminActionResult<{ email: string }>>;

export function LoginForm({ action = loginAction }: { action?: LoginAction }) {
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
    router.replace('/admin');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}
      <div>
        <label htmlFor="admin-email" className="mb-2 block text-sm font-bold text-ink">아이디(이메일)</label>
        <input id="admin-email" name="email" type="email" autoComplete="username" required className="h-12 w-full rounded-md border border-hairline px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-2 block text-sm font-bold text-ink">비밀번호</label>
        <input id="admin-password" name="password" type="password" autoComplete="current-password" required className="h-12 w-full rounded-md border border-hairline px-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
      </div>
      <Button type="primary" htmlType="submit" block disabled={pending}>{pending ? '로그인 중…' : '로그인'}</Button>
    </form>
  );
}
