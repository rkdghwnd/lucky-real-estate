import { describe, it, expect } from 'vitest';
import { siteConfig } from './site';

describe('siteConfig', () => {
  it('exposes all legally-required office fields as strings', () => {
    for (const key of ['name', 'representative', 'registrationNumber', 'phone', 'address', 'businessHours'] as const) {
      expect(typeof siteConfig[key]).toBe('string');
      expect(siteConfig[key].length).toBeGreaterThan(0);
    }
  });

  it('derives phoneHref as a tel: link', () => {
    expect(siteConfig.phoneHref.startsWith('tel:')).toBe(true);
  });
});
