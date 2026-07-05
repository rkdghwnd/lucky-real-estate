export const LISTING_IMAGES_BUCKET = 'listing-images';

export function isAbsoluteImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function resolveListingImage(pathOrUrl: string, supabaseUrl: string): string {
  if (isAbsoluteImageUrl(pathOrUrl)) return pathOrUrl;
  if (!supabaseUrl) return '';
  const base = supabaseUrl.replace(/\/$/, '');
  const path = pathOrUrl.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/${path}`;
}
