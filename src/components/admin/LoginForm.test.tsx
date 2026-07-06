import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/app/admin/actions', () => ({
  loginAction: vi.fn(),
  logoutAction: vi.fn(),
}));

import { LoginForm } from './LoginForm';

beforeEach(() => vi.clearAllMocks());

describe('LoginForm', () => {
  it('submits email and password and opens the dashboard', async () => {
    const action = vi.fn(async (form: FormData) => ({
      ok: true as const,
      data: { email: String(form.get('email')) },
    }));
    render(<LoginForm action={action} />);

    await userEvent.type(screen.getByLabelText('아이디(이메일)'), 'admin@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'password1234');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(action).toHaveBeenCalledOnce());
    expect(router.replace).toHaveBeenCalledWith('/admin');
    expect(router.refresh).toHaveBeenCalled();
  });

  it('shows a generic login error and keeps the form', async () => {
    const action = vi.fn(async () => ({
      ok: false as const,
      code: 'UNAUTHORIZED' as const,
      message: '아이디 또는 비밀번호를 확인해주세요.',
    }));
    render(<LoginForm action={action} />);
    await userEvent.type(screen.getByLabelText('아이디(이메일)'), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText('비밀번호'), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('아이디 또는 비밀번호를 확인해주세요.');
    expect(screen.getByLabelText('아이디(이메일)')).toHaveValue('wrong@example.com');
  });
});
