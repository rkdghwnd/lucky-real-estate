import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Listing } from '@/lib/types';
import { formatArea, formatDealPrice } from '@/lib/format';

export function ListingCard({ listing: l }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${l.slug}`}
      className="group flex flex-col overflow-hidden rounded-md border border-hairline bg-canvas transition hover:border-brand"
      aria-label={`${l.title} 상세보기`}
    >
      <div className="relative aspect-[4/3] bg-brand-light">
        {l.images[0] ? (
          <Image src={l.images[0]} alt={l.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-muted">사진 준비중</div>
        )}
        <Badge className="absolute left-2 top-2">{l.propertyType} · {l.dealType}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-1 text-base font-bold text-ink">{l.title}</h3>
        <p className="line-clamp-1 text-sm text-muted">📍 {l.address}</p>
        <div className="flex flex-wrap gap-x-3 text-sm text-ink">
          <span>대지 {formatArea(l.landAreaM2)}</span>
          {l.buildingAreaM2 != null && <span>건물 {formatArea(l.buildingAreaM2)}</span>}
        </div>
        <p className="mt-auto border-t border-hairline pt-2 text-base font-bold text-brand">{formatDealPrice(l)}</p>
      </div>
    </Link>
  );
}
