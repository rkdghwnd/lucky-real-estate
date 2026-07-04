import { describe, it, expect } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { rowToListing, applyFilters, getPublishedListings, getListingBySlug, getAllListingSlugs } from './listings';
import type { ListingRow } from './types';
import { sampleRows } from '@/test/fixtures/listings';

// Minimal thenable stand-in for the Supabase query builder.
function fakeClient(rows: ListingRow[]): SupabaseClient {
  let currentRows = [...rows];
  const builder = {
    select() { return builder; },
    eq(col: keyof ListingRow, val: unknown) {
      currentRows = currentRows.filter(r => r[col] === val);
      return builder;
    },
    order() { return builder; },
    single() {
      const row = currentRows[0] ?? null;
      return Promise.resolve({ data: row, error: row ? null : { message: 'no rows' } });
    },
    then<TResult1 = { data: ListingRow[]; error: null }, TResult2 = never>(
      onfulfilled?: ((value: { data: ListingRow[]; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
      onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
    ) {
      return Promise.resolve({ data: currentRows, error: null }).then(onfulfilled, onrejected);
    },
  };
  return {
    from() {
      currentRows = [...rows];
      return builder;
    },
  } as unknown as SupabaseClient;
}

describe('rowToListing', () => {
  it('maps snake_case row to camelCase domain object', () => {
    const l = rowToListing(sampleRows[0]);
    expect(l.propertyType).toBe('공장');
    expect(l.landAreaM2).toBe(1000);
    expect(l.monthlyRent).toBeNull();
    expect(l.images).toHaveLength(2);
  });
});

describe('applyFilters', () => {
  const listings = sampleRows.map(rowToListing);
  it('전체 returns everything', () => {
    expect(applyFilters(listings, { propertyType: '전체', dealType: '전체' })).toHaveLength(3);
  });
  it('filters by property type and deal type', () => {
    expect(applyFilters(listings, { propertyType: '공장' })).toHaveLength(1);
    expect(applyFilters(listings, { dealType: '임대' })).toHaveLength(1);
  });
});

describe('queries', () => {
  it('getPublishedListings returns only 공개 rows, mapped', async () => {
    const result = await getPublishedListings(fakeClient(sampleRows));
    expect(result).toHaveLength(2);
    expect(result.every(l => l.status === '공개')).toBe(true);
  });
  it('getListingBySlug returns the matching 공개 listing', async () => {
    const l = await getListingBySlug('factory-sale-01', fakeClient(sampleRows));
    expect(l?.slug).toBe('factory-sale-01');
  });
  it('getListingBySlug returns null when the slug is hidden/missing', async () => {
    const l = await getListingBySlug('hidden-01', fakeClient(sampleRows));
    expect(l).toBeNull();
  });
  it('getAllListingSlugs returns 공개 slugs only', async () => {
    const slugs = await getAllListingSlugs(fakeClient(sampleRows));
    expect(slugs).toContain('factory-sale-01');
    expect(slugs).not.toContain('hidden-01');
  });
});
