import { beforeEach, expect, it, vi } from 'vitest';

const revalidatePath = vi.hoisted(() => vi.fn());
vi.mock('next/cache', () => ({ revalidatePath }));

import { revalidateListingPaths } from './revalidate';

beforeEach(() => revalidatePath.mockClear());

it('revalidates every public listing surface', () => {
  revalidateListingPaths('listing-a');
  expect(revalidatePath).toHaveBeenCalledWith('/');
  expect(revalidatePath).toHaveBeenCalledWith('/listings');
  expect(revalidatePath).toHaveBeenCalledWith('/listings/listing-a');
  expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml');
});
