import type { MetadataRoute } from 'next';
import { getAllListingSlugs } from '@/lib/listings';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.siteUrl;
  const slugs = await getAllListingSlugs();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/listings`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.6 },
  ];
  const listingRoutes: MetadataRoute.Sitemap = slugs.map(slug => ({
    url: `${base}/listings/${slug}`, changeFrequency: 'weekly', priority: 0.7,
  }));
  return [...staticRoutes, ...listingRoutes];
}
