import { describe, it, expect } from 'vitest';
import robots from './robots';
import { siteConfig } from '@/lib/site';

describe('robots', () => {
  it('points at the sitemap and disallows /admin', () => {
    const r = robots();
    expect(r.sitemap).toBe(`${siteConfig.siteUrl}/sitemap.xml`);
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule?.disallow).toContain('/admin');
  });
});
