import { describe, expect, it } from 'vitest';
import { listingPayloadSchema, manwonToWon, parseListingForm, wonToManwon } from './listing-schema';

const basePayload = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: '오류동 제조공장',
  propertyType: '공장' as const,
  dealType: '매매' as const,
  status: '공개' as const,
  address: '인천 서구 오류동 1',
  addressPublic: true,
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
  images: ['123e4567/a.webp'],
  description: null,
};

describe('listing admin schema', () => {
  it('converts between 만원 and 원', () => {
    expect(manwonToWon('185,000')).toBe(1_850_000_000);
    expect(wonToManwon(1_850_000_000)).toBe('185000');
    expect(wonToManwon(null)).toBe('');
  });

  it('requires monthly rent for 임대', () => {
    const result = listingPayloadSchema.safeParse({
      ...basePayload,
      dealType: '임대',
      price: 300_000_000,
      monthlyRent: null,
    });
    expect(result.success).toBe(false);
  });

  it('requires a positive sale price', () => {
    const result = listingPayloadSchema.safeParse({ ...basePayload, price: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects server-controlled and unknown fields', () => {
    const result = listingPayloadSchema.safeParse({ ...basePayload, slug: 'listing-x' });
    expect(result.success).toBe(false);
  });

  it('parses a complete sale form', () => {
    const form = new FormData();
    form.set('title', '오류동 제조공장');
    form.set('propertyType', '공장');
    form.set('dealType', '매매');
    form.set('status', '공개');
    form.set('address', '인천 서구 오류동 1');
    form.set('addressPublic', 'true');
    form.set('priceManwon', '185000');
    form.set('landAreaM2', '1653');

    const result = parseListingForm(form);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.price).toBe(1_850_000_000);
      expect(result.data.monthlyRent).toBeNull();
      expect(result.data.landAreaM2).toBe(1653);
    }
  });

  it('returns field errors for an incomplete rental form', () => {
    const form = new FormData();
    form.set('title', '창고 임대');
    form.set('propertyType', '창고');
    form.set('dealType', '임대');
    form.set('status', '공개');
    form.set('address', '인천 서구 왕길동 1');
    form.set('priceManwon', '0');

    const result = parseListingForm(form);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.monthlyRent).toBeTruthy();
  });
});
