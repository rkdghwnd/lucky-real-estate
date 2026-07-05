import type { SupabaseClient } from '@supabase/supabase-js';
import { rowToListingWithUrl } from '@/lib/listings';
import type { Listing, ListingRow } from '@/lib/types';
import type { ListingPayload } from './listing-schema';
import { makeListingSlug } from './slug';

export interface AdminListing extends Listing {
  imagePaths: string[];
}

function toAdminListing(row: ListingRow): AdminListing {
  return {
    ...rowToListingWithUrl(row, process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''),
    imagePaths: row.images ?? [],
  };
}

function writableRow(input: ListingPayload) {
  return {
    title: input.title,
    property_type: input.propertyType,
    deal_type: input.dealType,
    address: input.address,
    price: input.price,
    monthly_rent: input.monthlyRent,
    land_area_m2: input.landAreaM2,
    building_area_m2: input.buildingAreaM2,
    zoning: input.zoning,
    land_category: input.landCategory,
    road_access: input.roadAccess,
    ceiling_height_m: input.ceilingHeightM,
    power_capacity: input.powerCapacity,
    completion_year: input.completionYear,
    lat: input.lat,
    lng: input.lng,
    images: input.images,
    description: input.description,
  };
}

function databaseFailure(error: { message?: string } | null): never {
  throw new Error(error?.message || 'Listing database request failed.');
}

export async function getAdminListings(client: SupabaseClient): Promise<AdminListing[]> {
  const { data, error } = await client.from('listings').select('*').order('updated_at', { ascending: false });
  if (error) databaseFailure(error);
  return ((data as ListingRow[] | null) ?? []).map(toAdminListing);
}

export async function getAdminListingById(client: SupabaseClient, id: string): Promise<AdminListing | null> {
  const { data, error } = await client.from('listings').select('*').eq('id', id).single();
  if (error || !data) return null;
  return toAdminListing(data as ListingRow);
}

export async function createAdminListing(
  client: SupabaseClient,
  input: ListingPayload,
  now = new Date(),
): Promise<AdminListing> {
  const { data, error } = await client.from('listings').insert({
    id: input.id,
    slug: makeListingSlug(input.id, now),
    status: '공개',
    ...writableRow(input),
  }).select('*').single();
  if (error || !data) databaseFailure(error);
  return toAdminListing(data as ListingRow);
}

export async function updateAdminListing(
  client: SupabaseClient,
  id: string,
  input: ListingPayload,
): Promise<AdminListing> {
  const { data, error } = await client.from('listings').update(writableRow(input)).eq('id', id).select('*').single();
  if (error || !data) databaseFailure(error);
  return toAdminListing(data as ListingRow);
}

export async function setAdminListingStatus(
  client: SupabaseClient,
  id: string,
  status: '공개' | '거래완료',
): Promise<{ slug: string }> {
  const { data, error } = await client.from('listings').update({ status }).eq('id', id).select('slug').single();
  if (error || !data) databaseFailure(error);
  return { slug: String((data as { slug: string }).slug) };
}
