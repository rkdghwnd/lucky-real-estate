import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/app/admin/actions', () => ({ logoutAction: vi.fn() }));

import { AdminHeader } from './AdminHeader';

it('shows the admin identity and logs out', async () => {
  const logout = vi.fn(async () => ({ ok: true as const, data: undefined }));
  render(<AdminHeader email="admin@example.com" logout={logout} />);
  expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '사이트 보기' })).toHaveAttribute('href', '/');
  await userEvent.click(screen.getByRole('button', { name: '로그아웃' }));
  await waitFor(() => expect(logout).toHaveBeenCalledOnce());
  expect(router.replace).toHaveBeenCalledWith('/admin/login');
});
