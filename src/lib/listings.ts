import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Listing, ListingRow, PropertyType, DealType } from './types';

export function rowToListing(r: ListingRow): Listing {
  return {
    id: r.id, slug: r.slug, title: r.title,
    propertyType: r.property_type, dealType: r.deal_type, status: r.status,
    address: r.address, landAreaM2: r.land_area_m2, buildingAreaM2: r.building_area_m2,
    price: r.price, monthlyRent: r.monthly_rent,
    zoning: r.zoning, landCategory: r.land_category, roadAccess: r.road_access,
    ceilingHeightM: r.ceiling_height_m, powerCapacity: r.power_capacity, completionYear: r.completion_year,
    lat: r.lat, lng: r.lng,
    images: r.images ?? [], description: r.description,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export interface ListingFilter {
  propertyType?: PropertyType | '전체';
  dealType?: DealType | '전체';
}

export function applyFilters(listings: Listing[], f: ListingFilter): Listing[] {
  return listings.filter(
    l =>
      (!f.propertyType || f.propertyType === '전체' || l.propertyType === f.propertyType) &&
      (!f.dealType || f.dealType === '전체' || l.dealType === f.dealType),
  );
}

export function createSupabaseServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY) are missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getPublishedListings(client: SupabaseClient = createSupabaseServerClient()): Promise<Listing[]> {
  const { data, error } = await client.from('listings').select('*').eq('status', '공개').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as ListingRow[]) ?? []).map(rowToListing);
}

export async function getFeaturedListings(limit = 6, client?: SupabaseClient): Promise<Listing[]> {
  const all = await getPublishedListings(client);
  return all.slice(0, limit);
}

export async function getListingBySlug(slug: string, client: SupabaseClient = createSupabaseServerClient()): Promise<Listing | null> {
  const { data, error } = await client.from('listings').select('*').eq('slug', slug).eq('status', '공개').single();
  if (error || !data) return null;
  return rowToListing(data as ListingRow);
}

export async function getAllListingSlugs(client: SupabaseClient = createSupabaseServerClient()): Promise<string[]> {
  const { data, error } = await client.from('listings').select('slug').eq('status', '공개');
  if (error) throw error;
  return ((data as { slug: string }[]) ?? []).map(r => r.slug);
}
