import { describe, it, expect } from 'vitest';
import { absoluteUrl, buildOrgJsonLd, buildListingJsonLd, buildWebsiteJsonLd, buildBreadcrumbJsonLd } from './seo';
import type { Listing } from './types';

const factory: Listing = {
  id: '1', slug: 'factory-sale-01', title: '오류동 제조공장',
  propertyType: '공장', dealType: '매매', status: '공개',
  address: '인천광역시 서구 오류동 000-0', addressPublic: true,
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

describe('buildWebsiteJsonLd', () => {
  it('is a WebSite with a SearchAction pointing at the listings search', () => {
    const w = buildWebsiteJsonLd() as {
      '@type': string;
      potentialAction: { '@type': string; target: { urlTemplate: string }; 'query-input': string };
    };
    expect(w['@type']).toBe('WebSite');
    expect(w.potentialAction['@type']).toBe('SearchAction');
    expect(w.potentialAction.target.urlTemplate).toContain('/listings?keyword={search_term_string}');
    expect(w.potentialAction['query-input']).toContain('search_term_string');
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('numbers items from 1 and only sets item URLs when a path is given', () => {
    const b = buildBreadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '현재' }]) as {
      '@type': string;
      itemListElement: { position: number; name: string; item?: string }[];
    };
    expect(b['@type']).toBe('BreadcrumbList');
    expect(b.itemListElement[0].position).toBe(1);
    expect(b.itemListElement[0].item).toMatch(/^http/);
    expect(b.itemListElement[1].position).toBe(2);
    expect(b.itemListElement[1].item).toBeUndefined();
  });
});
