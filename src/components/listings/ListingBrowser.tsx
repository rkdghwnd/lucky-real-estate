'use client';
import { useState } from 'react';
import type { Listing, PropertyType, DealType } from '@/lib/types';
import { applyFilters } from '@/lib/listings';
import { ListingCard } from './ListingCard';
import { FilterPanel } from './FilterPanel';

export function ListingBrowser({ listings }: { listings: Listing[] }) {
  const [type, setType] = useState<PropertyType | '전체'>('전체');
  const [deal, setDeal] = useState<DealType | '전체'>('전체');
  const shown = applyFilters(listings, { propertyType: type, dealType: deal });

  return (
    <div className="space-y-5">
      <FilterPanel propertyType={type} dealType={deal} onPropertyTypeChange={setType} onDealTypeChange={setDeal} resultCount={shown.length} />
      {shown.length === 0 ? (
        <p className="rounded-3xl border border-hairline bg-canvas py-16 text-center text-muted">
          조건에 맞는 공개 매물이 없습니다. 전화 주시면 비공개 매물까지 찾아드립니다.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
