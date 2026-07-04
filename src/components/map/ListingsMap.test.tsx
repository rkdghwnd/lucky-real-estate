import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListingsMap } from './ListingsMap';
import { rowToListing } from '@/lib/listings';
import { sampleRows } from '@/test/fixtures/listings';

// siteConfig.naverMapClientId is '' in the test env → fallback branch.
describe('ListingsMap (no key)', () => {
  it('falls back to a list of listing links when there is no Naver Maps key', () => {
    const listings = sampleRows.map(rowToListing);
    render(<ListingsMap listings={listings} />);
    expect(screen.getByText('지도로 볼 수 있는 매물이 준비 중입니다')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(listings[0].title) })).toHaveAttribute('href', `/listings/${listings[0].slug}`);
  });

  it('shows the same fallback when there are no listings at all', () => {
    render(<ListingsMap listings={[]} />);
    expect(screen.getByText('지도로 볼 수 있는 매물이 준비 중입니다')).toBeInTheDocument();
  });
});
