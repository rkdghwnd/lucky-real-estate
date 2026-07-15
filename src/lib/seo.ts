import { siteConfig } from './site';
import type { Listing } from './types';

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.siteUrl).toString();
}

export function buildOrgJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${siteConfig.siteUrl}/#organization`,
    name: siteConfig.name,
    telephone: siteConfig.phone,
    url: siteConfig.siteUrl,
    image: absoluteUrl('/banner0.jpg'),
    areaServed: '인천광역시 서구',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressLocality: '인천광역시 서구',
      streetAddress: siteConfig.address,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
  };
}

export function buildWebsiteJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteConfig.siteUrl,
    name: siteConfig.name,
    inLanguage: 'ko-KR',
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path?: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
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
