import { describe, it, expect } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { rowToListing, applyFilters, getPublishedListings, getListingBySlug, getAllListingSlugs } from './listings';
import type { ListingRow } from './types';
import { sampleRows } from '@/test/fixtures/listings';

// Minimal thenable stand-in for the Supabase query builder.
function fakeClient(rows: ListingRow[]): SupabaseClient {
  const builder: Record<string, unknown> = {
    _rows: [...rows],
    select() { return this; },
    eq(col: string, val: unknown) { (this as any)._rows = (this as any)._rows.filter((r: any) => r[col] === val); return this; },
    order() { return this; },
    single() { const r = (this as any)._rows[0] ?? null; return Promise.resolve({ data: r, error: r ? null : { message: 'no rows' } }); },
    then(resolve: (v: { data: unknown; error: null }) => void) { resolve({ data: (this as any)._rows, error: null }); },
  };
  return { from() { return builder; } } as unknown as SupabaseClient;
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
