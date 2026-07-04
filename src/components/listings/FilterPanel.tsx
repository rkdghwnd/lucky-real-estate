'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    <Card role="region" aria-label="매물 필터">
      <CardHeader>
        <p className="text-sm font-semibold text-muted">매물 필터 · <span className="font-bold text-ink">{resultCount}</span>건</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold text-muted">매물 종류</p>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => onPropertyTypeChange(type)}
                aria-pressed={propertyType === type}
                className={`h-10 rounded-full border px-4 text-sm font-semibold transition ${
                  propertyType === type ? 'border-brand bg-brand text-white' : 'border-hairline bg-canvas text-ink hover:border-brand'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-muted">거래 유형</p>
          <div className="flex flex-wrap gap-2">
            {DEAL_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => onDealTypeChange(type)}
                aria-pressed={dealType === type}
                className={`h-10 rounded-full border px-4 text-sm font-semibold transition ${
                  dealType === type ? 'border-brand bg-brand text-white' : 'border-hairline bg-canvas text-ink hover:border-brand'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
