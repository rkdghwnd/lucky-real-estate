import { describe, it, expect } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { rowToListing, applyFilters, matchArea, matchPrice, getPublishedListings, getListingBySlug, getAllListingSlugs } from './listings';
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

  it('resolves managed Storage paths without changing legacy URLs', () => {
    const l = rowToListing(
      { ...sampleRows[0], images: ['listing-id/a.webp', 'https://legacy.example/a.jpg'] },
      'https://x.supabase.co',
    );
    expect(l.images).toEqual([
      'https://x.supabase.co/storage/v1/object/public/listing-images/listing-id/a.webp',
      'https://legacy.example/a.jpg',
    ]);
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

describe('matchArea', () => {
  it('60평 이하 includes 60, excludes 61', () => {
    expect(matchArea('~60', 60)).toBe(true);
    expect(matchArea('~60', 61)).toBe(false);
  });
  it('100-200 excludes the lower boundary, includes the upper', () => {
    expect(matchArea('100-200', 100)).toBe(false);
    expect(matchArea('100-200', 200)).toBe(true);
  });
  it('전체 always matches', () => {
    expect(matchArea('전체', 5)).toBe(true);
  });
});

describe('matchPrice', () => {
  const sale = rowToListing({ ...sampleRows[0], deal_type: '매매', price: 150_000_000, monthly_rent: null });
  const rent = rowToListing({ ...sampleRows[0], deal_type: '임대', price: 30_000_000, monthly_rent: 2_000_000 });
  it('매매 bucket matches on price and requires 매매 dealType', () => {
    expect(matchPrice('매매:1-2억', sale)).toBe(true);
    expect(matchPrice('매매:1-2억', rent)).toBe(false);
  });
  it('임대 bucket matches on monthlyRent and requires 임대 dealType', () => {
    expect(matchPrice('임대:100-300만', rent)).toBe(true);
    expect(matchPrice('임대:100-300만', sale)).toBe(false);
  });
});

describe('applyFilters (buckets)', () => {
  const listings = sampleRows.map(rowToListing);
  it('filters by area bucket on 대지면적 (평 환산)', () => {
    // row0 1000㎡≈303평, row1 2000㎡≈605평, row2 1500㎡≈454평 -> all above 300
    expect(applyFilters(listings, { areaBucket: '300~' })).toHaveLength(3);
    expect(applyFilters(listings, { areaBucket: '~60' })).toHaveLength(0);
  });
  it('excludes null land area when an area bucket is set', () => {
    const withNull = [rowToListing({ ...sampleRows[0], land_area_m2: null })];
    expect(applyFilters(withNull, { areaBucket: '100-200' })).toHaveLength(0);
  });
  it('filters 매매 by price bucket', () => {
    // row0 매매 18.5억 -> 10-20억 bucket; row2 매매 9억 excluded
    const out = applyFilters(listings, { dealType: '매매', priceBucket: '매매:10-20억' });
    expect(out).toHaveLength(1);
    expect(out[0].slug).toBe('factory-sale-01');
  });
});
