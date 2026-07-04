'use client';
import type { DealType, PropertyType } from '@/lib/types';

const PROPERTY_TYPES: (PropertyType | '전체')[] = ['전체', '공장', '창고', '토지', '기타'];
const DEAL_TYPES: (DealType | '전체')[] = ['전체', '매매', '임대'];

interface FilterPanelProps {
  propertyType: PropertyType | '전체';
  dealType: DealType | '전체';
  onPropertyTypeChange: (value: PropertyType | '전체') => void;
  onDealTypeChange: (value: DealType | '전체') => void;
  resultCount: number;
}

export function FilterPanel({ propertyType, dealType, onPropertyTypeChange, onDealTypeChange, resultCount }: FilterPanelProps) {
  return (
    <section className="rounded-xl border border-neutral-200/80 bg-white shadow-sm" aria-label="매물 필터">
      <div className="border-b border-neutral-100 px-4 py-3">
        <span className="flex h-1 w-9 rounded-full bg-gold" aria-hidden="true" />
        <p className="mt-2 text-sm font-black text-muted">매물 필터 · <span className="text-brand">{resultCount}</span>건</p>
      </div>
      <div className="flex flex-col gap-4 px-4 py-4">
        <div>
          <p className="mb-2 text-xs font-bold text-muted">매물 종류</p>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => onPropertyTypeChange(type)}
                aria-pressed={propertyType === type}
                className={`h-10 rounded-full border px-4 text-sm font-bold transition ${
                  propertyType === type ? 'border-brand bg-brand text-white' : 'border-neutral-300 bg-white text-ink hover:border-brand'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-muted">거래 유형</p>
          <div className="flex flex-wrap gap-2">
            {DEAL_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => onDealTypeChange(type)}
                aria-pressed={dealType === type}
                className={`h-10 rounded-full border px-4 text-sm font-bold transition ${
                  dealType === type ? 'border-accent bg-accent text-white' : 'border-neutral-300 bg-white text-ink hover:border-accent'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
