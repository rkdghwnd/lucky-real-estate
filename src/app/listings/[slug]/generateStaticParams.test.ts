import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/listings', () => ({
  getAllListingSlugs: vi.fn().mockResolvedValue(['a', 'b']),
  getListingBySlug: vi.fn(),
}));

import { dynamicParams, generateStaticParams } from './page';

describe('listing detail generateStaticParams', () => {
  it('allows newly-created slugs to render at runtime', () => {
    expect(dynamicParams).toBe(true);
  });

  it('returns one param object per published slug', async () => {
    await expect(generateStaticParams()).resolves.toEqual([{ slug: 'a' }, { slug: 'b' }]);
  });
});
