export function makeListingSlug(id: string, now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = id.replaceAll('-', '').slice(0, 6).toLowerCase();
  return `listing-${date}-${suffix}`;
}
