import Link from 'next/link';
import Image from 'next/image';
import { Card } from 'antd';
import { MapPin } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { formatArea, formatDealPrice } from '@/lib/format';

export function ListingCard({ listing: l }: { listing: Listing }) {
  const cover = (
    <div className="relative aspect-[4/3] overflow-hidden bg-brand-light">
      {l.images[0] ? (
        <Image
          src={l.images[0]}
          alt={l.title}
          fill
          sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm font-medium text-muted">사진 준비중</div>
      )}
      <div className="absolute left-3 top-3 flex gap-2">
        <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md border ${l.dealType === '매매' ? 'border-brand/30 bg-brand/90 text-white' : 'border-emerald-600/30 bg-emerald-600/90 text-white'}`}>
          {l.dealType}
        </div>
        <div className="inline-flex items-center rounded-full border border-white/20 bg-ink/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
          {l.propertyType}
        </div>
      </div>
      {/* Subtle inner shadow for image depth */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/5" />
    </div>
  );

  return (
    <Link href={`/listings/${l.slug}`} aria-label={`${l.title} 상세보기`} className="group block h-full">
      <Card
        hoverable
        cover={cover}
        styles={{ body: { padding: 20 } }}
        className="h-full overflow-hidden rounded-2xl border border-hairline/80 bg-canvas transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-hairline hover:shadow-[var(--shadow-floating)]"
      >
        <h3 className="line-clamp-1 text-base font-bold tracking-tight text-ink group-hover:text-brand transition-colors duration-200">{l.title}</h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{l.address}</span>
        </p>
        <p className="mt-1.5 text-sm font-medium text-muted/80">{formatArea(l.landAreaM2)}</p>
        <p className="mt-3 text-lg font-extrabold tracking-tight text-brand">{formatDealPrice(l)}</p>
      </Card>
    </Link>
  );
}
