import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/listings', () => ({ getAllListingSlugs: vi.fn().mockResolvedValue(['a', 'b']) }));

import sitemap from './sitemap';
import { siteConfig } from '@/lib/site';

describe('sitemap', () => {
  it('includes static routes and one entry per listing', async () => {
    const entries = await sitemap();
    const urls = entries.map(e => e.url);
    expect(urls).toContain(`${siteConfig.siteUrl}`);
    expect(urls).toContain(`${siteConfig.siteUrl}/listings`);
    expect(urls).toContain(`${siteConfig.siteUrl}/about`);
    expect(urls).toContain(`${siteConfig.siteUrl}/listings/a`);
    expect(urls).toContain(`${siteConfig.siteUrl}/listings/b`);
  });
});
