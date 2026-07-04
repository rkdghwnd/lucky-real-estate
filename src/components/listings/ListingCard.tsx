import Link from 'next/link';
import Image from 'next/image';
import type { Listing } from '@/lib/types';
import { formatArea, formatDealPrice, formatListingNo } from '@/lib/format';

export function ListingCard({ listing: l }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${l.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      aria-label={`${l.title} 상세보기`}
    >
      <div className="relative aspect-[4/3] bg-neutral-100">
        {l.images[0] ? (
          <Image src={l.images[0]} alt={l.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-muted">사진 준비중</div>
        )}
        <span className="absolute left-2.5 top-2.5 rounded-md bg-navy px-2.5 py-1 text-xs font-black text-white shadow-sm">{l.propertyType}</span>
        <span className="absolute bottom-2.5 left-2.5 rounded-md bg-accent px-2.5 py-1 text-xs font-black text-white shadow-sm">{l.dealType}</span>
        <span className="absolute right-2.5 top-2.5 rounded-md bg-black/55 px-2 py-1 text-[11px] font-bold text-white">{formatListingNo(l)}</span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-sm font-bold text-muted">{l.propertyType} · {l.dealType}</p>
        <h3 className="mt-0.5 line-clamp-1 text-lg font-black text-ink">{l.title}</h3>
        <p className="mt-1.5 text-sm text-muted">📍 {l.address}</p>
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 border-t border-dashed border-neutral-200 pt-2.5 text-sm text-ink">
          <span>대지 {formatArea(l.landAreaM2)}</span>
          {l.buildingAreaM2 != null && <span>건물 {formatArea(l.buildingAreaM2)}</span>}
        </div>
        <p className="mt-auto pt-2.5 text-lg font-black text-sale">{formatDealPrice(l)}</p>
      </div>
    </Link>
  );
}
