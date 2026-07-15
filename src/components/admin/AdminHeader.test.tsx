import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const navigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}));
vi.mock('@/lib/admin/api', () => ({ logoutAction: vi.fn() }));

import { AdminHeader } from './AdminHeader';

it('shows the admin identity and logs out', async () => {
  const logout = vi.fn(async () => ({ ok: true as const, data: undefined }));
  render(
    <MemoryRouter>
      <AdminHeader email="admin@example.com" logout={logout} />
    </MemoryRouter>,
  );
  expect(screen.getByText('admin@example.com')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '사이트 보기' })).toHaveAttribute('href', '/');
  await userEvent.click(screen.getByRole('button', { name: '로그아웃' }));
  await waitFor(() => expect(logout).toHaveBeenCalledOnce());
  expect(navigate).toHaveBeenCalledWith('/admin/login', { replace: true });
});
