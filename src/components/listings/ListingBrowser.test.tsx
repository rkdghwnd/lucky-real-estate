import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingBrowser } from './ListingBrowser';
import { rowToListing } from '@/lib/listings';
import { sampleRows } from '@/test/fixtures/listings';

const publicListings = sampleRows.filter(r => r.status === '공개').map(rowToListing);

describe('ListingBrowser', () => {
  it('filters to 공장 when the 공장 button is pressed', async () => {
    const user = userEvent.setup();
    render(<ListingBrowser listings={publicListings} />);
    expect(screen.getByText('오류동 제조공장')).toBeInTheDocument();
    expect(screen.getByText('오류동 공장부지')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '공장' }));
    expect(screen.getByText('오류동 제조공장')).toBeInTheDocument();
    expect(screen.queryByText('오류동 공장부지')).toBeNull();
  });
});
