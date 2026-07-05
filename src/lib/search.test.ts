import { describe, it, expect } from 'vitest';
import { rowToListing } from './listings';
import { sampleRows } from '@/test/fixtures/listings';
import { extractRegion, availableRegions, filterListings, sortListings, searchListings, criteriaFromParams } from './search';

const all = sampleRows.map(rowToListing);

describe('extractRegion', () => {
  it('extracts the 동 from an address', () => {
    expect(extractRegion('인천광역시 서구 오류동 000-0')).toBe('오류동');
  });
  it('extracts 읍/면 as well', () => {
    expect(extractRegion('경기도 김포시 양촌읍 산단로 1')).toBe('양촌읍');
  });
  it('returns null when no dong/eup/myeon', () => {
    expect(extractRegion('인천광역시 서구')).toBeNull();
  });
});

describe('availableRegions', () => {
  it('returns unique regions sorted (ko)', () => {
    expect(availableRegions(all)).toEqual(['오류동', '왕길동']);
  });
});

describe('filterListings', () => {
  it('filters by dealType and propertyType', () => {
    expect(filterListings(all, { dealType: '매매' }).map(l => l.slug)).toEqual(['factory-sale-01', 'hidden-01']);
    expect(filterListings(all, { propertyType: '토지' }).map(l => l.slug)).toEqual(['land-lease-01']);
  });
  it('filters by region', () => {
    expect(filterListings(all, { region: '왕길동' }).map(l => l.slug)).toEqual(['hidden-01']);
  });
  it('filters by price min/max (원)', () => {
    expect(filterListings(all, { priceMax: 500_000_000 }).map(l => l.slug)).toEqual(['land-lease-01']);
    expect(filterListings(all, { priceMin: 1_000_000_000 }).map(l => l.slug)).toEqual(['factory-sale-01']);
  });
  it('filters by area min/max (㎡, 대지)', () => {
    expect(filterListings(all, { areaMin: 1500 }).map(l => l.slug).sort()).toEqual(['hidden-01', 'land-lease-01']);
  });
  it('filters by keyword over title + address', () => {
    expect(filterListings(all, { keyword: '공장부지' }).map(l => l.slug)).toEqual(['land-lease-01']);
    expect(filterListings(all, { keyword: '왕길' }).map(l => l.slug)).toEqual(['hidden-01']);
  });
});

describe('sortListings', () => {
  it('sorts by price desc / asc', () => {
    expect(sortListings(all, 'priceDesc').map(l => l.slug)).toEqual(['factory-sale-01', 'hidden-01', 'land-lease-01']);
    expect(sortListings(all, 'priceAsc')[0].slug).toBe('land-lease-01');
  });
  it('sorts by latest (createdAt desc) by default', () => {
    expect(sortListings(all).map(l => l.slug)).toEqual(['factory-sale-01', 'land-lease-01', 'hidden-01']);
  });
});

describe('searchListings', () => {
  it('paginates the filtered+sorted result', () => {
    const page1 = searchListings(all, { pageSize: 2, page: 1 });
    expect(page1.total).toBe(3);
    expect(page1.totalPages).toBe(2);
    expect(page1.items).toHaveLength(2);
    const page2 = searchListings(all, { pageSize: 2, page: 2 });
    expect(page2.items).toHaveLength(1);
  });
  it('clamps the page into range', () => {
    expect(searchListings(all, { pageSize: 2, page: 99 }).page).toBe(2);
  });
});

describe('criteriaFromParams', () => {
  it('parses deal/type/region/keyword/sort/page', () => {
    const c = criteriaFromParams(new URLSearchParams('deal=매매&type=공장&region=원당동&keyword=신축&sort=priceAsc&page=2'));
    expect(c).toMatchObject({ dealType: '매매', propertyType: '공장', region: '원당동', keyword: '신축', sort: 'priceAsc', page: 2 });
  });
  it('converts price min/max from 만원 to 원 and area stays ㎡', () => {
    const c = criteriaFromParams(new URLSearchParams('pmin=50000&pmax=100000&amin=500&amax=1000'));
    expect(c.priceMin).toBe(500_000_000);
    expect(c.priceMax).toBe(1_000_000_000);
    expect(c.areaMin).toBe(500);
    expect(c.areaMax).toBe(1000);
  });
  it('defaults to 전체/latest/page 1 when empty', () => {
    const c = criteriaFromParams(new URLSearchParams(''));
    expect(c).toMatchObject({ dealType: '전체', propertyType: '전체', region: '전체', sort: 'latest', page: 1 });
    expect(c.priceMin).toBeNull();
  });
});
