import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { formatArea, formatDealPrice } from '@/lib/format';

export function ListingCard({ listing: l }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${l.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-hairline bg-canvas shadow-[0_1px_2px_rgba(10,11,13,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_12px_28px_rgba(10,11,13,0.10)]"
      aria-label={`${l.title} 상세보기`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-light">
        {l.images[0] ? (
          <Image
            src={l.images[0]}
            alt={l.title}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-muted">사진 준비중</div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-bold text-white ${l.dealType === '매매' ? 'bg-brand' : 'bg-emerald-600'}`}
          >
            {l.dealType}
          </span>
          <span className="rounded-md bg-ink/75 px-2 py-0.5 text-xs font-bold text-white backdrop-blur-sm">{l.propertyType}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 text-base font-bold tracking-tight text-ink transition-colors group-hover:text-brand">{l.title}</h3>
        <p className="flex items-center gap-1 text-sm text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{l.address}</span>
        </p>
        <p className="text-sm text-muted">{formatArea(l.landAreaM2)}</p>
        <p className="mt-auto pt-1.5 text-lg font-extrabold tracking-tight text-brand">{formatDealPrice(l)}</p>
      </div>
    </Link>
  );
}
