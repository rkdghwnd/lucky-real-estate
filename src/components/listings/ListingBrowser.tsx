'use client';
import { useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Select, Pagination, Empty, Button } from 'antd';
import { searchListings, criteriaFromParams, availableRegions, type SortKey } from '@/lib/search';
import type { Listing } from '@/lib/types';
import { SearchFilters, type FilterDraft } from './SearchFilters';
import { ListingCard } from './ListingCard';

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
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const spString = searchParams.toString();

  const sp = useMemo(() => new URLSearchParams(spString), [spString]);
  const criteria = useMemo(() => criteriaFromParams(sp), [sp]);
  const regions = useMemo(() => availableRegions(listings), [listings]);
  const result = useMemo(() => searchListings(listings, criteria), [listings, criteria]);

  const push = (next: URLSearchParams) => {
    const qs = next.toString();
    navigate(qs ? `${pathname}?${qs}` : pathname);
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
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-lg font-extrabold text-ink">
            전체 매물 <span className="text-brand">{result.total}</span>건
          </p>
          <Select
            aria-label="정렬"
            value={criteria.sort ?? 'latest'}
            onChange={changeSort}
            options={SORTS}
            style={{ width: 130 }}
            className="rounded-xl border-hairline"
          />
        </div>

        {result.items.length === 0 ? (
          <div className="rounded-3xl border border-hairline bg-canvas px-6 py-20 text-center shadow-sm">
            {listings.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-ink font-bold">
                    아직 등록된 매물이 없습니다.
                    <br />
                    <span className="text-sm font-semibold text-muted">전화 주시면 조건에 맞는 매물을 찾아드립니다.</span>
                  </span>
                }
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-ink font-bold">
                    조건에 맞는 매물이 없습니다.
                    <br />
                    <span className="text-sm font-semibold text-muted">필터를 바꾸거나 초기화해 보세요.</span>
                  </span>
                }
              >
                <Button className="rounded-xl font-bold bg-surface border-0 text-ink hover:bg-hairline" onClick={() => push(new URLSearchParams())}>필터 초기화</Button>
              </Empty>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {result.items.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}

        {result.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              current={result.page}
              total={result.total}
              pageSize={result.pageSize}
              onChange={changePage}
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
