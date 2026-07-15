import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { getAdminListings, getAdminListingById } from './listings';

// staleTime 0 so the dashboard refetches on every mount — after create/edit we
// navigate back to /admin and want the change reflected immediately.
export function useAdminListings() {
  return useQuery({
    queryKey: ['adminListings'],
    queryFn: () => getAdminListings(supabase),
    staleTime: 0,
  });
}

export function useAdminListing(id: string | undefined) {
  return useQuery({
    queryKey: ['adminListing', id],
    queryFn: () => getAdminListingById(supabase, id as string),
    enabled: Boolean(id),
  });
}
