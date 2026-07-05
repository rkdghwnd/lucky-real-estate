import { describe, expect, it } from 'vitest';
import { resolveListingImage } from './listing-images';

describe('resolveListingImage', () => {
  it('keeps legacy absolute URLs', () => {
    expect(resolveListingImage('https://legacy.example/a.jpg', 'https://x.supabase.co'))
      .toBe('https://legacy.example/a.jpg');
  });

  it('resolves a Storage object path', () => {
    expect(resolveListingImage('listing-id/a photo.webp', 'https://x.supabase.co'))
      .toBe('https://x.supabase.co/storage/v1/object/public/listing-images/listing-id/a%20photo.webp');
  });

  it('returns an empty string when the base URL is missing', () => {
    expect(resolveListingImage('listing-id/a.webp', '')).toBe('');
  });
});
