import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingSearch } from './ListingSearch';
import { rowToListing } from '@/lib/listings';
import { sampleRows } from '@/test/fixtures/listings';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/listings',
  useSearchParams: () => new URLSearchParams(''),
}));

const listings = sampleRows.filter(r => r.status === '공개').map(rowToListing);

describe('ListingSearch', () => {
  it('filters to 공장 when the 공장 chip is pressed', async () => {
    const user = userEvent.setup();
    render(<ListingSearch listings={listings} />);
    expect(screen.getByText('오류동 제조공장')).toBeInTheDocument();
    expect(screen.getByText('오류동 공장부지')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '공장' }));
    expect(screen.getByText('오류동 제조공장')).toBeInTheDocument();
    expect(screen.queryByText('오류동 공장부지')).toBeNull();
  });

  it('shows an empty-state message when nothing matches (공장 + 임대)', async () => {
    const user = userEvent.setup();
    render(<ListingSearch listings={listings} />);
    await user.click(screen.getByRole('button', { name: '공장' }));
    await user.click(screen.getByRole('button', { name: '임대' }));
    expect(screen.getByText(/조건에 맞는 공개 매물이 없습니다/)).toBeInTheDocument();
  });
});
