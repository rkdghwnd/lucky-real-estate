import { useQuery } from '@tanstack/react-query';
import { getPublishedListings, getListingBySlug } from './listings';

// Public data is read live from Supabase in the browser (RLS: anon reads
// status='공개'). staleTime is set globally in main.tsx.
export function useListings() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: () => getPublishedListings(),
  });
}

export function useListing(slug: string | undefined) {
  return useQuery({
    queryKey: ['listing', slug],
    queryFn: () => getListingBySlug(slug as string),
    enabled: Boolean(slug),
  });
}
