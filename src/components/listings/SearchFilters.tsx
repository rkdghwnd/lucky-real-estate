'use client';
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FilterDraft {
  dealType: string;
  propertyType: string;
  region: string;
  priceMin: string;
  priceMax: string;
  areaMin: string;
  areaMax: string;
  keyword: string;
}

export const EMPTY_DRAFT: FilterDraft = {
  dealType: '전체',
  propertyType: '전체',
  region: '전체',
  priceMin: '',
  priceMax: '',
  areaMin: '',
  areaMax: '',
  keyword: '',
};

const DEALS = ['전체', '매매', '임대'];
const TYPES = ['전체', '공장', '창고', '토지', '기타'];
const fieldCls =
  'h-11 w-full rounded-md border border-hairline bg-canvas px-3 text-ink outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30';

function RadioRow({ legend, name, options, value, onChange }: { legend: string; name: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-ink">{legend}</legend>
      <div className="flex flex-col gap-1.5">
        {options.map(o => (
          <label key={o} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="size-4 accent-brand" />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SearchFilters({
  initial,
  regions,
  onApply,
  onReset,
}: {
  initial: FilterDraft;
  regions: string[];
  onApply: (draft: FilterDraft) => void;
  onReset: () => void;
}) {
  const [d, setD] = useState<FilterDraft>(initial);
  const set = (patch: Partial<FilterDraft>) => setD(prev => ({ ...prev, ...patch }));

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onApply(d);
      }}
      aria-label="매물 검색 필터"
      className="h-fit rounded-lg border border-hairline bg-canvas p-5 lg:sticky lg:top-24"
    >
      <p className="mb-5 flex items-center gap-2 text-base font-bold text-ink">
        <SlidersHorizontal className="size-[1.05rem] text-brand" aria-hidden="true" />
        필터
      </p>
      <div className="flex flex-col gap-5">
        <div>
          <label htmlFor="f-keyword" className="mb-2 block text-sm font-bold text-ink">키워드</label>
          <input id="f-keyword" aria-label="키워드" value={d.keyword} onChange={e => set({ keyword: e.target.value })} placeholder="예: 원당동 공장" className={fieldCls} />
        </div>
        <RadioRow legend="거래유형" name="f-deal" options={DEALS} value={d.dealType} onChange={v => set({ dealType: v })} />
        <RadioRow legend="매물종류" name="f-type" options={TYPES} value={d.propertyType} onChange={v => set({ propertyType: v })} />
        <div>
          <label htmlFor="f-region" className="mb-2 block text-sm font-bold text-ink">지역</label>
          <select id="f-region" aria-label="지역" value={d.region} onChange={e => set({ region: e.target.value })} className={fieldCls}>
            <option value="전체">전체</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-ink">가격 (만원)</p>
          <div className="flex items-center gap-2">
            <input inputMode="numeric" aria-label="가격 최소" placeholder="최소" value={d.priceMin} onChange={e => set({ priceMin: e.target.value })} className={fieldCls} />
            <span className="text-muted">~</span>
            <input inputMode="numeric" aria-label="가격 최대" placeholder="최대" value={d.priceMax} onChange={e => set({ priceMax: e.target.value })} className={fieldCls} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold text-ink">면적 (㎡)</p>
          <div className="flex items-center gap-2">
            <input inputMode="numeric" aria-label="면적 최소" placeholder="최소" value={d.areaMin} onChange={e => set({ areaMin: e.target.value })} className={fieldCls} />
            <span className="text-muted">~</span>
            <input inputMode="numeric" aria-label="면적 최대" placeholder="최대" value={d.areaMax} onChange={e => set({ areaMax: e.target.value })} className={fieldCls} />
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button type="submit" className="flex-1">검색</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setD(EMPTY_DRAFT);
              onReset();
            }}
          >
            초기화
          </Button>
        </div>
      </div>
    </form>
  );
}
