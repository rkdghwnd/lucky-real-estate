import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

describe('SearchBar', () => {
  it('renders the filter controls and the search button', () => {
    render(<SearchBar regions={['원당동', '오류동']} />);
    expect(screen.getByText('거래유형 전체')).toBeInTheDocument();
    expect(screen.getByText('매물종류 전체')).toBeInTheDocument();
    expect(screen.getByText('지역 전체')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /검색/ })).toBeInTheDocument();
  });

  it('navigates to /listings when the search button is pressed', async () => {
    const user = userEvent.setup();
    push.mockClear();
    render(<SearchBar regions={['원당동', '오류동']} />);
    await user.click(screen.getByRole('button', { name: /검색/ }));
    expect(push).toHaveBeenCalledWith('/listings');
  });
});
