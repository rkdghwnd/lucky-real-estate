import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ListingPayload } from '@/lib/admin/listing-schema';

const mocks = vi.hoisted(() => ({
  client: { auth: { signInWithPassword: vi.fn(), signOut: vi.fn(), resetPasswordForEmail: vi.fn(), updateUser: vi.fn() } },
  getAdminAccess: vi.fn(),
  createAdminListing: vi.fn(),
  updateAdminListing: vi.fn(),
  setAdminListingStatus: vi.fn(),
  revalidateListingPaths: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({ createServerSupabaseClient: vi.fn(async () => mocks.client) }));
vi.mock('@/lib/admin/auth', () => ({ getAdminAccess: mocks.getAdminAccess }));
vi.mock('@/lib/admin/listings', () => ({
  createAdminListing: mocks.createAdminListing,
  updateAdminListing: mocks.updateAdminListing,
  setAdminListingStatus: mocks.setAdminListingStatus,
}));
vi.mock('@/lib/admin/revalidate', () => ({ revalidateListingPaths: mocks.revalidateListingPaths }));

import { createListingAction, setListingStatusAction } from './actions';

const payload: ListingPayload = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: '오류동 제조공장',
  propertyType: '공장',
  dealType: '매매',
  address: '인천 서구 오류동 1',
  price: 1_850_000_000,
  monthlyRent: null,
  landAreaM2: 1653,
  buildingAreaM2: 992,
  zoning: null,
  landCategory: null,
  roadAccess: null,
  ceilingHeightM: null,
  powerCapacity: null,
  completionYear: null,
  lat: null,
  lng: null,
  images: ['id/a.webp'],
  description: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAdminAccess.mockResolvedValue({ userId: 'u1', email: 'admin@example.com' });
  mocks.createAdminListing.mockResolvedValue({ ...payload, slug: 'listing-a' });
  mocks.setAdminListingStatus.mockResolvedValue({ slug: 'listing-a' });
});

describe('admin actions', () => {
  it('rejects mutations when the session is not an allowed admin', async () => {
    mocks.getAdminAccess.mockResolvedValue(null);
    await expect(createListingAction(payload)).resolves.toMatchObject({ ok: false, code: 'UNAUTHORIZED' });
    expect(mocks.createAdminListing).not.toHaveBeenCalled();
  });

  it('validates, creates, and revalidates a listing', async () => {
    await expect(createListingAction(payload)).resolves.toMatchObject({ ok: true });
    expect(mocks.createAdminListing).toHaveBeenCalledWith(mocks.client, payload);
    expect(mocks.revalidateListingPaths).toHaveBeenCalledWith('listing-a');
  });

  it('rejects an unknown payload field', async () => {
    await expect(createListingAction({ ...payload, status: '거래완료' })).resolves.toMatchObject({ ok: false, code: 'VALIDATION' });
  });

  it('changes status and revalidates the affected listing', async () => {
    await expect(setListingStatusAction(payload.id, '거래완료')).resolves.toMatchObject({ ok: true });
    expect(mocks.setAdminListingStatus).toHaveBeenCalledWith(mocks.client, payload.id, '거래완료');
    expect(mocks.revalidateListingPaths).toHaveBeenCalledWith('listing-a');
  });
});
