import type { Listing, PropertyType, DealType } from './types';

export type SortKey = 'latest' | 'priceDesc' | 'priceAsc';

export interface SearchCriteria {
  dealType?: DealType | '전체';
  propertyType?: PropertyType | '전체';
  region?: string; // '전체' or a dong name
  priceMin?: number | null; // 원
  priceMax?: number | null; // 원
  areaMin?: number | null; // ㎡ (대지)
  areaMax?: number | null; // ㎡ (대지)
  keyword?: string;
  sort?: SortKey;
  page?: number; // 1-based
  pageSize?: number;
}

export interface SearchResult {
  items: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const DEFAULT_PAGE_SIZE = 9;

const REGION_RE = /([가-힣]+(?:동|읍|면))/;

export function extractRegion(address: string): string | null {
  const m = address?.match(REGION_RE);
  return m ? m[1] : null;
}

export function availableRegions(listings: Listing[]): string[] {
  const set = new Set<string>();
  for (const l of listings) {
    const r = extractRegion(l.address);
    if (r) set.add(r);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'ko'));
}

export function filterListings(listings: Listing[], c: SearchCriteria): Listing[] {
  const kw = c.keyword?.trim().toLowerCase();
  return listings.filter(l => {
    if (c.dealType && c.dealType !== '전체' && l.dealType !== c.dealType) return false;
    if (c.propertyType && c.propertyType !== '전체' && l.propertyType !== c.propertyType) return false;
    if (c.region && c.region !== '전체' && extractRegion(l.address) !== c.region) return false;
    if (c.priceMin != null && l.price < c.priceMin) return false;
    if (c.priceMax != null && l.price > c.priceMax) return false;
    if (c.areaMin != null && (l.landAreaM2 == null || l.landAreaM2 < c.areaMin)) return false;
    if (c.areaMax != null && (l.landAreaM2 == null || l.landAreaM2 > c.areaMax)) return false;
    if (kw) {
      const hay = `${l.title} ${l.address}`.toLowerCase();
      if (!hay.includes(kw)) return false;
    }
    return true;
  });
}

export function sortListings(listings: Listing[], sort: SortKey = 'latest'): Listing[] {
  const arr = [...listings];
  switch (sort) {
    case 'priceDesc':
      arr.sort((a, b) => b.price - a.price);
      break;
    case 'priceAsc':
      arr.sort((a, b) => a.price - b.price);
      break;
    case 'latest':
    default:
      arr.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
      break;
  }
  return arr;
}

export function searchListings(listings: Listing[], c: SearchCriteria = {}): SearchResult {
  const filtered = sortListings(filterListings(listings, c), c.sort);
  const total = filtered.length;
  const pageSize = c.pageSize && c.pageSize > 0 ? c.pageSize : DEFAULT_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, c.page ?? 1), totalPages);
  const start = (page - 1) * pageSize;
  return { items: filtered.slice(start, start + pageSize), total, page, pageSize, totalPages };
}
