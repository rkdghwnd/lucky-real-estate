'use client';
import { useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { searchListings, criteriaFromParams, availableRegions, type SortKey } from '@/lib/search';
import type { Listing } from '@/lib/types';
import { SearchFilters, type FilterDraft } from './SearchFilters';
import { ListingCard } from './ListingCard';
import { Pagination } from './Pagination';

const SORTS: { value: SortKey; label: string }[] = [
  { value: 'latest', label: '최신순' },
  { value: 'priceDesc', label: '가격 높은순' },
  { value: 'priceAsc', label: '가격 낮은순' },
];

function draftFromParams(sp: URLSearchParams): FilterDraft {
  return {
    dealType: sp.get('deal') || '전체',
    propertyType: sp.get('type') || '전체',
    region: sp.get('region') || '전체',
    priceMin: sp.get('pmin') || '',
    priceMax: sp.get('pmax') || '',
    areaMin: sp.get('amin') || '',
    areaMax: sp.get('amax') || '',
    keyword: sp.get('keyword') || '',
  };
}

export function ListingBrowser({ listings }: { listings: Listing[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const spString = searchParams.toString();

  const sp = useMemo(() => new URLSearchParams(spString), [spString]);
  const criteria = useMemo(() => criteriaFromParams(sp), [sp]);
  const regions = useMemo(() => availableRegions(listings), [listings]);
  const result = useMemo(() => searchListings(listings, criteria), [listings, criteria]);

  const push = (next: URLSearchParams) => {
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const applyFilters = (d: FilterDraft) => {
    const p = new URLSearchParams();
    if (d.keyword.trim()) p.set('keyword', d.keyword.trim());
    if (d.dealType !== '전체') p.set('deal', d.dealType);
    if (d.propertyType !== '전체') p.set('type', d.propertyType);
    if (d.region !== '전체') p.set('region', d.region);
    if (d.priceMin.trim()) p.set('pmin', d.priceMin.trim());
    if (d.priceMax.trim()) p.set('pmax', d.priceMax.trim());
    if (d.areaMin.trim()) p.set('amin', d.areaMin.trim());
    if (d.areaMax.trim()) p.set('amax', d.areaMax.trim());
    const sort = sp.get('sort');
    if (sort) p.set('sort', sort);
    push(p);
  };

  const changeSort = (sort: string) => {
    const p = new URLSearchParams(spString);
    if (sort === 'latest') p.delete('sort');
    else p.set('sort', sort);
    p.delete('page');
    push(p);
  };

  const changePage = (page: number) => {
    const p = new URLSearchParams(spString);
    if (page <= 1) p.delete('page');
    else p.set('page', String(page));
    push(p);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <SearchFilters key={spString} initial={draftFromParams(sp)} regions={regions} onApply={applyFilters} onReset={() => push(new URLSearchParams())} />
      <div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-lg font-bold text-ink">
            전체 매물 <span className="text-brand">{result.total}</span>건
          </p>
          <select
            aria-label="정렬"
            value={criteria.sort}
            onChange={e => changeSort(e.target.value)}
            className="h-10 rounded-md border border-hairline bg-canvas px-3 text-sm text-ink outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30"
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {result.items.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-hairline bg-canvas px-6 py-20 text-center">
            <p className="font-semibold text-ink">조건에 맞는 공개 매물이 없습니다.</p>
            <p className="text-sm text-muted">전화 주시면 비공개 매물까지 찾아드립니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {result.items.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}

        {result.totalPages > 1 && (
          <div className="mt-8">
            <Pagination page={result.page} totalPages={result.totalPages} onChange={changePage} />
          </div>
        )}
      </div>
    </div>
  );
}
