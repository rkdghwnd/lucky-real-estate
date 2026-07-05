import { expect, it } from 'vitest';
import { makeListingSlug } from './slug';

it('creates a stable date and UUID based slug', () => {
  expect(makeListingSlug('123e4567-e89b-12d3-a456-426614174000', new Date('2026-07-06T00:00:00Z')))
    .toBe('listing-20260706-123e45');
});
