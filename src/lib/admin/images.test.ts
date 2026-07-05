import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const compress = vi.hoisted(() => vi.fn());
vi.mock('browser-image-compression', () => ({ default: compress }));

import {
  cleanupListingImages,
  optimizeListingImage,
  uploadPendingImages,
  validateImageFiles,
  type ListingImageItem,
} from './images';

function file(name: string, type = 'image/jpeg', size = 12) {
  return new File([new Uint8Array(size)], name, { type });
}

beforeEach(() => {
  compress.mockReset();
  compress.mockImplementation(async (source: File) => new File([source], source.name, { type: 'image/webp' }));
});

describe('validateImageFiles', () => {
  it('accepts JPEG, PNG, and WebP within the 20-image limit', () => {
    expect(validateImageFiles([
      file('a.jpg', 'image/jpeg'),
      file('b.png', 'image/png'),
      file('c.webp', 'image/webp'),
    ], 17)).toBeNull();
  });

  it('rejects unsupported files, more than 20 images, and a source over 20MB', () => {
    expect(validateImageFiles([file('a.gif', 'image/gif')], 0)).toContain('JPG, PNG, WebP');
    expect(validateImageFiles([file('a.jpg')], 20)).toContain('20장');
    expect(validateImageFiles([file('huge.jpg', 'image/jpeg', 20 * 1024 * 1024 + 1)], 0)).toContain('20MB');
  });
});

it('optimizes to a generated WebP filename with the required limits', async () => {
  compress.mockResolvedValueOnce(new Blob(['optimized'], { type: 'image/webp' }));
  const result = await optimizeListingImage(file('현장 사진.PNG', 'image/png'));

  expect(compress).toHaveBeenCalledWith(expect.any(File), {
    maxSizeMB: 5,
    maxWidthOrHeight: 2000,
    fileType: 'image/webp',
    initialQuality: 0.82,
    useWebWorker: true,
  });
  expect(result.name).toMatch(/^[a-f0-9-]+\.webp$/);
  expect(result.type).toBe('image/webp');
});

it('uploads at most three pending images and returns paths in display order', async () => {
  let active = 0;
  let maxActive = 0;
  const uploaded: string[] = [];
  const upload = vi.fn(async (path: string) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise(resolve => setTimeout(resolve, 5));
    uploaded.push(path);
    active -= 1;
    return { error: null };
  });
  const client = {
    storage: { from: () => ({ upload }) },
  } as unknown as SupabaseClient;
  const items: ListingImageItem[] = [
    { id: 'stored', path: 'listing-id/existing.webp', previewUrl: '/existing.webp' },
    ...Array.from({ length: 5 }, (_, index) => ({
      id: `pending-${index}`,
      file: file(`${index}.jpg`),
      previewUrl: `blob:${index}`,
    })),
  ];
  const statuses: string[] = [];

  const result = await uploadPendingImages(client, 'listing-id', items, (id, status) => statuses.push(`${id}:${status}`));

  expect(maxActive).toBe(3);
  expect(result.paths[0]).toBe('listing-id/existing.webp');
  expect(result.paths.slice(1)).toHaveLength(5);
  expect(result.paths.slice(1).every(path => /^listing-id\/[a-f0-9-]+\.webp$/.test(path))).toBe(true);
  expect(new Set(result.uploadedPaths)).toEqual(new Set(uploaded));
  expect(statuses).toContain('pending-0:uploading');
  expect(statuses).toContain('pending-0:done');
});

it('removes only managed object paths and ignores cleanup errors', async () => {
  const remove = vi.fn(async () => ({ error: { message: 'best effort' } }));
  const client = {
    storage: { from: vi.fn(() => ({ remove })) },
  } as unknown as SupabaseClient;

  await expect(cleanupListingImages(client, [
    'listing-id/one.webp',
    'https://legacy.example/two.jpg',
    '',
  ])).resolves.toBeUndefined();

  expect(remove).toHaveBeenCalledWith(['listing-id/one.webp']);
});
