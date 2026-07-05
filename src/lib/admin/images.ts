import imageCompression from 'browser-image-compression';
import type { SupabaseClient } from '@supabase/supabase-js';

export const LISTING_IMAGE_BUCKET = 'listing-images';
const MAX_IMAGE_COUNT = 20;
const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface PendingListingImage {
  id: string;
  file: File;
  previewUrl: string;
}

export interface StoredListingImage {
  id: string;
  path: string;
  previewUrl: string;
}

export type ListingImageItem = PendingListingImage | StoredListingImage;

export class ListingImageUploadError extends Error {
  constructor(message: string, public readonly uploadedPaths: string[]) {
    super(message);
    this.name = 'ListingImageUploadError';
  }
}

export function isPendingListingImage(item: ListingImageItem): item is PendingListingImage {
  return 'file' in item;
}

export function validateImageFiles(files: File[], currentCount: number): string | null {
  if (currentCount + files.length > MAX_IMAGE_COUNT) return '사진은 최대 20장까지 등록할 수 있습니다.';
  if (files.some(file => !ACCEPTED_IMAGE_TYPES.has(file.type))) return 'JPG, PNG, WebP 사진만 등록할 수 있습니다.';
  if (files.some(file => file.size > MAX_SOURCE_BYTES)) return '원본 사진 한 장의 크기는 20MB 이하여야 합니다.';
  return null;
}

export async function optimizeListingImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxSizeMB: 5,
    maxWidthOrHeight: 2000,
    fileType: 'image/webp',
    initialQuality: 0.82,
    useWebWorker: true,
  });
  return new File([compressed], `${globalThis.crypto.randomUUID()}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  });
}

export async function uploadPendingImages(
  client: SupabaseClient,
  listingId: string,
  items: ListingImageItem[],
  onStatus: (id: string, status: 'uploading' | 'done' | 'failed') => void,
): Promise<{ paths: string[]; uploadedPaths: string[] }> {
  const paths = items.map(item => isPendingListingImage(item) ? '' : item.path);
  const pending = items
    .map((item, index) => ({ item, index }))
    .filter((entry): entry is { item: PendingListingImage; index: number } => isPendingListingImage(entry.item));
  const uploadedPaths: string[] = [];
  let cursor = 0;
  let firstError: unknown = null;

  async function worker() {
    while (cursor < pending.length && firstError === null) {
      const entry = pending[cursor];
      cursor += 1;
      onStatus(entry.item.id, 'uploading');
      try {
        const optimized = await optimizeListingImage(entry.item.file);
        const path = `${listingId}/${optimized.name}`;
        const { error } = await client.storage.from(LISTING_IMAGE_BUCKET).upload(path, optimized, {
          contentType: 'image/webp',
          upsert: false,
        });
        if (error) throw new Error(error.message);
        paths[entry.index] = path;
        uploadedPaths.push(path);
        onStatus(entry.item.id, 'done');
      } catch (error) {
        firstError ??= error;
        onStatus(entry.item.id, 'failed');
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(3, pending.length) }, () => worker()));
  if (firstError !== null) {
    const message = firstError instanceof Error ? firstError.message : '사진 업로드에 실패했습니다.';
    throw new ListingImageUploadError(message, uploadedPaths);
  }
  return { paths, uploadedPaths };
}

export async function cleanupListingImages(client: SupabaseClient, paths: string[]): Promise<void> {
  const managedPaths = [...new Set(paths.filter(path => (
    path.length > 0
    && !path.startsWith('/')
    && !/^(?:https?:|blob:|data:)/i.test(path)
    && !path.includes('..')
  )))];
  if (managedPaths.length === 0) return;
  try {
    await client.storage.from(LISTING_IMAGE_BUCKET).remove(managedPaths);
  } catch {
    // Cleanup is best effort. The database remains the source of truth.
  }
}
