'use client';
import { useState } from 'react';
import type { Listing, PropertyType, DealType } from '@/lib/types';
import { applyFilters } from '@/lib/listings';
import { ListingCard } from './ListingCard';

const TYPES: (PropertyType | '전체')[] = ['전체', '공장', '창고', '토지', '기타'];
const DEALS: (DealType | '전체')[] = ['전체', '매매', '임대'];

export function ListingBrowser({ listings }: { listings: Listing[] }) {
  const [type, setType] = useState<PropertyType | '전체'>('전체');
  const [deal, setDeal] = useState<DealType | '전체'>('전체');
  const shown = applyFilters(listings, { propertyType: type, dealType: deal });

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {TYPES.map(t => (
          <button key={t} type="button" onClick={() => setType(t)} aria-pressed={type === t}
                  className={`rounded-full border px-4 py-2 text-lg ${type === t ? 'bg-brand text-white' : 'bg-white'}`}>{t}</button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {DEALS.map(d => (
          <button key={d} type="button" onClick={() => setDeal(d)} aria-pressed={deal === d}
                  className={`rounded-full border px-4 py-2 text-lg ${deal === d ? 'bg-accent text-white' : 'bg-white'}`}>{d}</button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="py-10 text-center text-muted">조건에 맞는 공개 매물이 없습니다. 전화 주시면 비공개 매물까지 찾아드립니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
