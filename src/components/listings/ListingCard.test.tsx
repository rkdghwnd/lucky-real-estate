import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListingCard } from './ListingCard';
import { rowToListing } from '@/lib/listings';
import { sampleRows } from '@/test/fixtures/listings';

describe('ListingCard', () => {
  it('renders the legally-required fields (종류/거래/소재지/면적/가격)', () => {
    render(<ListingCard listing={rowToListing(sampleRows[0])} />);
    expect(screen.getByText(/공장 · 매매/)).toBeInTheDocument();
    expect(screen.getByText(/인천광역시 서구 오류동/)).toBeInTheDocument();
    expect(screen.getByText(/㎡/)).toBeInTheDocument();
    expect(screen.getByText(/매매 18억/)).toBeInTheDocument();
  });
});
