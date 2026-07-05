'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AREA_BUCKETS, SALE_PRICE_BUCKETS, RENT_PRICE_BUCKETS, type AreaBucket, type PriceBucket } from '@/lib/listings';
import type { PropertyType, DealType } from '@/lib/types';

const PROPERTY_TYPES: (PropertyType | '전체')[] = ['전체', '공장', '창고', '토지', '기타'];
const DEAL_TYPES: (DealType | '전체')[] = ['전체', '매매', '임대'];

export interface FilterState {
  propertyType: PropertyType | '전체';
  dealType: DealType | '전체';
  areaBucket: AreaBucket;
  priceBucket: PriceBucket;
}

function Chip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-11 rounded-md border px-3 text-sm font-semibold transition ${
        active ? 'border-brand bg-brand text-white' : 'border-hairline bg-canvas text-ink hover:border-brand'
      }`}
    >
      {children}
    </button>
  );
}

export function FilterSidebar({
  state,
  resultCount,
  onChange,
  onReset,
}: {
  state: FilterState;
  resultCount: number;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
}) {
  const priceBuckets =
    state.dealType === '매매' ? SALE_PRICE_BUCKETS : state.dealType === '임대' ? RENT_PRICE_BUCKETS : null;

  return (
    <Card aria-label="매물 필터">
      <CardHeader className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">
          검색결과 <span className="font-bold text-ink">{resultCount}</span>건
        </p>
        <button type="button" onClick={onReset} className="text-sm font-semibold text-brand hover:text-brand-dark">
          초기화
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted">종류</p>
          <div className="flex flex-wrap gap-1.5">
            {PROPERTY_TYPES.map(t => (
              <Chip key={t} active={state.propertyType === t} onClick={() => onChange({ propertyType: t })}>{t}</Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted">거래유형</p>
          <div className="flex flex-wrap gap-1.5">
            {DEAL_TYPES.map(t => (
              <Chip key={t} active={state.dealType === t} onClick={() => onChange({ dealType: t, priceBucket: '전체' })}>{t}</Chip>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="area-bucket" className="mb-1.5 block text-xs font-semibold text-muted">평수 구간</label>
          <select
            id="area-bucket"
            aria-label="평수 구간"
            value={state.areaBucket}
            onChange={e => onChange({ areaBucket: e.target.value as AreaBucket })}
            className="h-11 w-full rounded-md border border-hairline bg-canvas px-2 text-ink"
          >
            {AREA_BUCKETS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        {priceBuckets && (
          <div>
            <label htmlFor="price-bucket" className="mb-1.5 block text-xs font-semibold text-muted">가격 구간</label>
            <select
              id="price-bucket"
              aria-label="가격 구간"
              value={state.priceBucket}
              onChange={e => onChange({ priceBucket: e.target.value as PriceBucket })}
              className="h-11 w-full rounded-md border border-hairline bg-canvas px-2 text-ink"
            >
              <option value="전체">가격 전체</option>
              {priceBuckets.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
