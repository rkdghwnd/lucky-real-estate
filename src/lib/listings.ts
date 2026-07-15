import type { SupabaseClient } from '@supabase/supabase-js';
import type { Listing, ListingRow, PropertyType, DealType } from './types';
import { pyeong } from './format';
import { resolveListingImage } from './listing-images';
import { supabase } from './supabase/client';

export function rowToListing(r: ListingRow): Listing {
  return rowToListingWithUrl(r, import.meta.env.VITE_SUPABASE_URL ?? '');
}

export function rowToListingWithUrl(r: ListingRow, supabaseUrl: string): Listing {
  return {
    id: r.id, slug: r.slug, title: r.title,
    propertyType: r.property_type, dealType: r.deal_type, status: r.status,
    address: r.address, landAreaM2: r.land_area_m2, buildingAreaM2: r.building_area_m2,
    price: r.price, monthlyRent: r.monthly_rent,
    zoning: r.zoning, landCategory: r.land_category, roadAccess: r.road_access,
    ceilingHeightM: r.ceiling_height_m, powerCapacity: r.power_capacity, completionYear: r.completion_year,
    lat: r.lat, lng: r.lng,
    images: (r.images ?? []).map(image => resolveListingImage(image, supabaseUrl)).filter(Boolean),
    description: r.description,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export type AreaBucket = '전체' | '~60' | '60-100' | '100-200' | '200-300' | '300~';
export type PriceBucket =
  | '전체'
  | '매매:~5천' | '매매:5천-1억' | '매매:1-2억' | '매매:2-5억' | '매매:5-10억' | '매매:10-20억' | '매매:20억~'
  | '임대:~100만' | '임대:100-300만' | '임대:300-500만' | '임대:500-1000만' | '임대:1000만~';

interface AreaBucketDef { value: AreaBucket; label: string; min: number; max: number | null } // 평
export const AREA_BUCKETS: AreaBucketDef[] = [
  { value: '전체', label: '평수 전체', min: 0, max: null },
  { value: '~60', label: '60평 이하', min: 0, max: 60 },
  { value: '60-100', label: '60~100평', min: 60, max: 100 },
  { value: '100-200', label: '100~200평', min: 100, max: 200 },
  { value: '200-300', label: '200~300평', min: 200, max: 300 },
  { value: '300~', label: '300평 이상', min: 300, max: null },
];

interface PriceBucketDef { value: PriceBucket; label: string; deal: DealType; min: number; max: number | null } // 원
export const SALE_PRICE_BUCKETS: PriceBucketDef[] = [
  { value: '매매:~5천', label: '5천만원 이하', deal: '매매', min: 0, max: 50_000_000 },
  { value: '매매:5천-1억', label: '5천만~1억', deal: '매매', min: 50_000_000, max: 100_000_000 },
  { value: '매매:1-2억', label: '1억~2억', deal: '매매', min: 100_000_000, max: 200_000_000 },
  { value: '매매:2-5억', label: '2억~5억', deal: '매매', min: 200_000_000, max: 500_000_000 },
  { value: '매매:5-10억', label: '5억~10억', deal: '매매', min: 500_000_000, max: 1_000_000_000 },
  { value: '매매:10-20억', label: '10억~20억', deal: '매매', min: 1_000_000_000, max: 2_000_000_000 },
  { value: '매매:20억~', label: '20억 이상', deal: '매매', min: 2_000_000_000, max: null },
];
export const RENT_PRICE_BUCKETS: PriceBucketDef[] = [
  { value: '임대:~100만', label: '월 100만원 이하', deal: '임대', min: 0, max: 1_000_000 },
  { value: '임대:100-300만', label: '월 100~300만', deal: '임대', min: 1_000_000, max: 3_000_000 },
  { value: '임대:300-500만', label: '월 300~500만', deal: '임대', min: 3_000_000, max: 5_000_000 },
  { value: '임대:500-1000만', label: '월 500~1000만', deal: '임대', min: 5_000_000, max: 10_000_000 },
  { value: '임대:1000만~', label: '월 1000만 이상', deal: '임대', min: 10_000_000, max: null },
];

export function matchArea(bucket: AreaBucket, pyeongVal: number): boolean {
  const def = AREA_BUCKETS.find(b => b.value === bucket);
  if (!def || def.value === '전체') return true;
  return pyeongVal > def.min && (def.max == null || pyeongVal <= def.max);
}

export function matchPrice(bucket: PriceBucket, l: Listing): boolean {
  if (bucket === '전체') return true;
  const def = [...SALE_PRICE_BUCKETS, ...RENT_PRICE_BUCKETS].find(b => b.value === bucket);
  if (!def || l.dealType !== def.deal) return false;
  const value = def.deal === '매매' ? l.price : l.monthlyRent;
  if (value == null) return false;
  return value > def.min && (def.max == null || value <= def.max);
}

export interface ListingFilter {
  propertyType?: PropertyType | '전체';
  dealType?: DealType | '전체';
  areaBucket?: AreaBucket;
  priceBucket?: PriceBucket;
}

export function applyFilters(listings: Listing[], f: ListingFilter): Listing[] {
  return listings.filter(l => {
    if (f.propertyType && f.propertyType !== '전체' && l.propertyType !== f.propertyType) return false;
    if (f.dealType && f.dealType !== '전체' && l.dealType !== f.dealType) return false;
    if (f.areaBucket && f.areaBucket !== '전체') {
      if (l.landAreaM2 == null || !matchArea(f.areaBucket, pyeong(l.landAreaM2))) return false;
    }
    if (f.priceBucket && f.priceBucket !== '전체') {
      if (!matchPrice(f.priceBucket, l)) return false;
    }
    return true;
  });
}

export async function getPublishedListings(client: SupabaseClient = supabase): Promise<Listing[]> {
  const { data, error } = await client.from('listings').select('*').eq('status', '공개').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as ListingRow[]) ?? []).map(rowToListing);
}

export async function getFeaturedListings(limit = 6, client?: SupabaseClient): Promise<Listing[]> {
  const all = await getPublishedListings(client);
  return all.slice(0, limit);
}

export async function getListingBySlug(slug: string, client: SupabaseClient = supabase): Promise<Listing | null> {
  const { data, error } = await client.from('listings').select('*').eq('slug', slug).eq('status', '공개').single();
  if (error || !data) return null;
  return rowToListing(data as ListingRow);
}

export async function getAllListingSlugs(client: SupabaseClient = supabase): Promise<string[]> {
  const { data, error } = await client.from('listings').select('slug').eq('status', '공개');
  if (error) throw error;
  return ((data as { slug: string }[]) ?? []).map(r => r.slug);
}
