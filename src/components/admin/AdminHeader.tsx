import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from 'antd';
import { logoutAction, type AdminActionResult } from '@/lib/admin/api';

type LogoutAction = () => Promise<AdminActionResult>;

export function AdminHeader({ email, logout = logoutAction }: { email: string; logout?: LogoutAction }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <header className="border-b border-hairline bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5">
        <Link to="/admin" className="flex items-center gap-3 font-extrabold text-ink">
          <span className="grid size-9 place-items-center rounded-md bg-brand text-white">행</span>
          <span>매물 관리</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" target="_blank" className="font-semibold text-brand">사이트 보기</Link>
          <span className="hidden text-muted sm:inline">{email}</span>
          <Button htmlType="button" size="large" onClick={handleLogout} disabled={pending}>로그아웃</Button>
        </div>
      </div>
    </header>
  );
}
