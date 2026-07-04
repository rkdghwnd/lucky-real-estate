import Link from 'next/link';
import Image from 'next/image';
import type { Listing } from '@/lib/types';
import { formatArea, formatDealPrice } from '@/lib/format';

export function ListingCard({ listing: l }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${l.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-hairline bg-canvas transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)]"
      aria-label={`${l.title} 상세보기`}
    >
      <div className="relative aspect-[4/3] bg-brand-light">
        {l.images[0] ? (
          <Image src={l.images[0]} alt={l.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-muted">사진 준비중</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-canvas px-3 py-1 text-xs font-semibold text-ink">{l.propertyType} · {l.dealType}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-ink">{l.title}</h3>
        <p className="mt-1.5 text-sm text-muted">📍 {l.address}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-hairline pt-3 text-sm text-ink">
          <span>대지 {formatArea(l.landAreaM2)}</span>
          {l.buildingAreaM2 != null && <span>건물 {formatArea(l.buildingAreaM2)}</span>}
        </div>
        <p className="mt-auto pt-3 text-lg font-bold text-ink">{formatDealPrice(l)}</p>
      </div>
    </Link>
  );
}
