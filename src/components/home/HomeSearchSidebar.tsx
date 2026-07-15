'use client';

import { useNavigate } from 'react-router-dom';
import { SearchFilters, EMPTY_DRAFT, type FilterDraft } from '@/components/listings/SearchFilters';

// Home left-sidebar search. Reuses the listings filter panel, but instead of
// filtering in place it launches /listings with the chosen criteria as query
// params (same param names as ListingBrowser reads). Sticky is handled by the
// page's grid-item aside, so the panel's own sticky is disabled here.
export function HomeSearchSidebar({ regions }: { regions: string[] }) {
  const navigate = useNavigate();

  const apply = (d: FilterDraft) => {
    const p = new URLSearchParams();
    if (d.keyword.trim()) p.set('keyword', d.keyword.trim());
    if (d.dealType !== '전체') p.set('deal', d.dealType);
    if (d.propertyType !== '전체') p.set('type', d.propertyType);
    if (d.region !== '전체') p.set('region', d.region);
    if (d.priceMin.trim()) p.set('pmin', d.priceMin.trim());
    if (d.priceMax.trim()) p.set('pmax', d.priceMax.trim());
    if (d.areaMin.trim()) p.set('amin', d.areaMin.trim());
    if (d.areaMax.trim()) p.set('amax', d.areaMax.trim());
    const qs = p.toString();
    navigate(qs ? `/listings?${qs}` : '/listings');
  };

  return (
    <SearchFilters
      initial={EMPTY_DRAFT}
      regions={regions}
      onApply={apply}
      onReset={() => {
        // Nothing to reset on the home — SearchFilters clears its own draft.
      }}
      sticky={false}
    />
  );
}
