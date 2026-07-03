import { describe, it, expect } from 'vitest';
import { absoluteUrl, buildListingMetadata, buildOrgJsonLd, buildListingJsonLd } from './seo';
import type { Listing } from './types';

// Self-contained literal — this task must not depend on Task 5's rowToListing.
const factory: Listing = {
  id: '1', slug: 'factory-sale-01', title: '오류동 제조공장',
  propertyType: '공장', dealType: '매매', status: '공개',
  address: '인천광역시 서구 오류동 000-0',
  landAreaM2: 1000, buildingAreaM2: 600, price: 1_850_000_000, monthlyRent: null,
  zoning: '계획관리지역', landCategory: '공장용지', roadAccess: '6m 도로 접함',
  ceilingHeightM: 8, powerCapacity: '150kW', completionYear: 2015,
  lat: 37.57, lng: 126.665, images: ['https://x.supabase.co/a.jpg'],
  description: '설명', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z',
};

describe('absoluteUrl', () => {
  it('joins a path onto siteConfig.siteUrl', () => {
    expect(absoluteUrl('/listings/x')).toMatch(/\/listings\/x$/);
    expect(absoluteUrl('/listings/x').startsWith('http')).toBe(true);
  });
});

describe('buildListingMetadata', () => {
  it('sets a canonical url containing the slug and an OG image', () => {
    const m = buildListingMetadata(factory);
    expect(String(m.alternates?.canonical)).toMatch(/\/listings\/factory-sale-01$/);
    expect(m.openGraph?.images).toBeTruthy();
    expect(String(m.title)).toContain(factory.title);
  });
});

describe('buildOrgJsonLd', () => {
  it('is a RealEstateAgent with the office name', () => {
    const o = buildOrgJsonLd() as Record<string, unknown>;
    expect(o['@type']).toBe('RealEstateAgent');
    expect(o.name).toBeTruthy();
  });
});

describe('buildListingJsonLd', () => {
  it('is a Product whose Offer price matches the listing price in KRW', () => {
    const j = buildListingJsonLd(factory) as { '@type': string; offers: { price: number; priceCurrency: string } };
    expect(j['@type']).toBe('Product');
    expect(j.offers.price).toBe(factory.price);
    expect(j.offers.priceCurrency).toBe('KRW');
  });
});
