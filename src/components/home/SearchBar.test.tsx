import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

describe('SearchBar', () => {
  it('lists provided regions in the 지역 select', () => {
    render(<SearchBar regions={['원당동', '오류동']} />);
    expect(screen.getByRole('option', { name: '원당동' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '오류동' })).toBeInTheDocument();
  });

  it('navigates to /listings with the chosen filters on submit', async () => {
    const user = userEvent.setup();
    push.mockClear();
    render(<SearchBar regions={['원당동', '오류동']} />);
    await user.selectOptions(screen.getByLabelText('거래유형'), '매매');
    await user.selectOptions(screen.getByLabelText('매물종류'), '공장');
    await user.type(screen.getByLabelText('키워드 검색'), '원당');
    await user.click(screen.getByRole('button', { name: /검색/ }));
    expect(push).toHaveBeenCalledTimes(1);
    const url: string = push.mock.calls[0][0];
    const params = new URLSearchParams(url.split('?')[1] ?? '');
    expect(url.startsWith('/listings')).toBe(true);
    expect(params.get('deal')).toBe('매매');
    expect(params.get('type')).toBe('공장');
    expect(params.get('keyword')).toBe('원당');
  });
});
