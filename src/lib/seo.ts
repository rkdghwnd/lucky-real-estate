import type { Metadata } from 'next';
import { siteConfig } from './site';
import type { Listing } from './types';
import { formatArea, formatDealPrice } from './format';

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.siteUrl).toString();
}

export function buildListingMetadata(l: Listing): Metadata {
  const title = `${l.title} | ${siteConfig.shortName}`;
  const description = `${l.address} · ${l.propertyType} ${l.dealType} · ${formatArea(l.landAreaM2)} · ${formatDealPrice(l)}. 인천 서구 공장·창고·토지 전문 ${siteConfig.name}.`;
  const url = absoluteUrl(`/listings/${l.slug}`);
  const image = l.images[0] ?? absoluteUrl('/banner1.jpg');
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: siteConfig.name, images: [{ url: image }] },
  };
}

export function buildOrgJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: siteConfig.name,
    telephone: siteConfig.phone,
    url: siteConfig.siteUrl,
    areaServed: '인천광역시 서구',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressLocality: '인천광역시 서구',
      streetAddress: siteConfig.address,
    },
  };
}

export function buildVerificationMetadata(
  naverSiteVerification: string = siteConfig.naverSiteVerification,
  googleSiteVerification: string = siteConfig.googleSiteVerification,
): Metadata['verification'] {
  const verification: NonNullable<Metadata['verification']> = {};
  if (googleSiteVerification) verification.google = googleSiteVerification;
  if (naverSiteVerification) verification.other = { 'naver-site-verification': naverSiteVerification };
  return Object.keys(verification).length > 0 ? verification : undefined;
}

export function buildListingJsonLd(l: Listing): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: l.title,
    description: l.description ?? `${l.address} ${l.propertyType} ${l.dealType}`,
    image: l.images,
    category: l.propertyType,
    offers: {
      '@type': 'Offer',
      price: l.price,
      priceCurrency: 'KRW',
      availability: l.status === '공개' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: absoluteUrl(`/listings/${l.slug}`),
    },
  };
}
