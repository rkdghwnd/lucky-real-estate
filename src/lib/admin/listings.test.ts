import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ListingRow } from '@/lib/types';
import type { ListingPayload } from './listing-schema';
import {
  createAdminListing,
  getAdminListingById,
  getAdminListings,
  setAdminListingStatus,
  updateAdminListing,
} from './listings';

const row: ListingRow = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  slug: 'listing-20260706-123e45',
  title: '오류동 제조공장',
  property_type: '공장',
  deal_type: '매매',
  status: '공개',
  address: '인천 서구 오류동 1',
  land_area_m2: 1653,
  building_area_m2: 992,
  price: 1_850_000_000,
  monthly_rent: null,
  zoning: null,
  land_category: null,
  road_access: null,
  ceiling_height_m: null,
  power_capacity: null,
  completion_year: null,
  lat: null,
  lng: null,
  images: ['123e4567/a.webp'],
  description: '설명',
  created_at: '2026-07-06T00:00:00.000Z',
  updated_at: '2026-07-06T00:00:00.000Z',
};

const payload: ListingPayload = {
  id: row.id,
  title: row.title,
  propertyType: row.property_type,
  dealType: row.deal_type,
  address: row.address,
  price: row.price,
  monthlyRent: null,
  landAreaM2: row.land_area_m2,
  buildingAreaM2: row.building_area_m2,
  zoning: null,
  landCategory: null,
  roadAccess: null,
  ceilingHeightM: null,
  powerCapacity: null,
  completionYear: null,
  lat: null,
  lng: null,
  images: row.images,
  description: row.description,
};

function builderFor(data: unknown) {
  const builder = {
    select: vi.fn(() => builder),
    order: vi.fn(async () => ({ data, error: null })),
    eq: vi.fn(() => builder),
    single: vi.fn(async () => ({ data: Array.isArray(data) ? data[0] ?? null : data, error: null })),
    insert: vi.fn((_value: unknown) => builder),
    update: vi.fn((_value: unknown) => builder),
  };
  const client = { from: vi.fn(() => builder) };
  return { client, builder };
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
});

describe('admin listing repository', () => {
  it('loads listings in updated order and preserves image paths', async () => {
    const { client, builder } = builderFor([row]);
    const listings = await getAdminListings(client as never);
    expect(builder.order).toHaveBeenCalledWith('updated_at', { ascending: false });
    expect(listings[0].imagePaths).toEqual(row.images);
    expect(listings[0].images[0]).toContain('/listing-images/123e4567/a.webp');
  });

  it('loads one listing by id', async () => {
    const { client, builder } = builderFor(row);
    await expect(getAdminListingById(client as never, row.id)).resolves.toMatchObject({ id: row.id });
    expect(builder.eq).toHaveBeenCalledWith('id', row.id);
  });

  it('inserts a public snake-case row', async () => {
    const { client, builder } = builderFor(row);
    await createAdminListing(client as never, payload, new Date('2026-07-06T00:00:00Z'));
    expect(builder.insert).toHaveBeenCalledWith(expect.objectContaining({
      id: row.id,
      slug: row.slug,
      property_type: '공장',
      deal_type: '매매',
      status: '공개',
      land_area_m2: 1653,
      images: row.images,
    }));
  });

  it('updates writable fields without replacing id or slug', async () => {
    const { client, builder } = builderFor(row);
    await updateAdminListing(client as never, row.id, { ...payload, title: '수정된 제목' });
    expect(builder.update).toHaveBeenCalledWith(expect.objectContaining({ title: '수정된 제목' }));
    expect(builder.update.mock.calls[0][0]).not.toHaveProperty('id');
    expect(builder.update.mock.calls[0][0]).not.toHaveProperty('slug');
  });

  it('changes status and returns the affected slug', async () => {
    const { client, builder } = builderFor({ slug: row.slug });
    await expect(setAdminListingStatus(client as never, row.id, '거래완료')).resolves.toEqual({ slug: row.slug });
    expect(builder.update).toHaveBeenCalledWith({ status: '거래완료' });
  });
});
