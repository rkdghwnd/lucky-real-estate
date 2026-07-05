'use client';
import { useCallback, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { applyFilters, type AreaBucket, type PriceBucket } from '@/lib/listings';
import type { Listing } from '@/lib/types';
import { FilterSidebar, type FilterState } from './FilterSidebar';
import { ListingCard } from './ListingCard';
import { UnitConverter } from './UnitConverter';

function stateFromParams(sp: URLSearchParams): FilterState {
  return {
    propertyType: (sp.get('type') as FilterState['propertyType']) || '전체',
    dealType: (sp.get('deal') as FilterState['dealType']) || '전체',
    areaBucket: (sp.get('area') as AreaBucket) || '전체',
    priceBucket: (sp.get('price') as PriceBucket) || '전체',
  };
}

export function ListingSearch({ listings }: { listings: Listing[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<FilterState>(() => stateFromParams(new URLSearchParams(searchParams.toString())));

  const syncUrl = useCallback(
    (next: FilterState) => {
      const p = new URLSearchParams();
      if (next.propertyType !== '전체') p.set('type', next.propertyType);
      if (next.dealType !== '전체') p.set('deal', next.dealType);
      if (next.areaBucket !== '전체') p.set('area', next.areaBucket);
      if (next.priceBucket !== '전체') p.set('price', next.priceBucket);
      const qs = p.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const onChange = useCallback(
    (patch: Partial<FilterState>) => {
      setState(prev => {
        const next = { ...prev, ...patch };
        syncUrl(next);
        return next;
      });
    },
    [syncUrl],
  );

  const onReset = useCallback(() => {
    const next: FilterState = { propertyType: '전체', dealType: '전체', areaBucket: '전체', priceBucket: '전체' };
    setState(next);
    syncUrl(next);
  }, [syncUrl]);

  const shown = useMemo(() => applyFilters(listings, state), [listings, state]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="order-2 lg:order-1">
        {shown.length === 0 ? (
          <p className="rounded-md border border-hairline bg-canvas py-16 text-center text-muted">
            조건에 맞는 공개 매물이 없습니다. 전화 주시면 비공개 매물까지 찾아드립니다.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>
      <div className="order-1 lg:order-2 flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <FilterSidebar state={state} resultCount={shown.length} onChange={onChange} onReset={onReset} />
        <UnitConverter />
      </div>
    </div>
  );
}
