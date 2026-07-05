import { revalidatePath } from 'next/cache';

export function revalidateListingPaths(slug: string) {
  revalidatePath('/');
  revalidatePath('/listings');
  revalidatePath(`/listings/${slug}`);
  revalidatePath('/sitemap.xml');
}
