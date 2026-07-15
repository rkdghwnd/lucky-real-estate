import { Link } from 'react-router-dom';
import { Card } from 'antd';
import { MapPin } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { formatArea, formatDealPrice } from '@/lib/format';

export function ListingCard({ listing: l }: { listing: Listing }) {
  const cover = (
    <div className="relative aspect-[4/3] overflow-hidden bg-brand-light/30">
      {l.images[0] ? (
        <img
          src={l.images[0]}
          alt={l.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm font-semibold text-muted">사진 준비중</div>
      )}
      <div className="absolute left-3 top-3 flex gap-1.5">
        <div className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold ${l.dealType === '매매' ? 'bg-brand text-white' : 'bg-emerald-600 text-white'}`}>
          {l.dealType}
        </div>
        <div className="inline-flex items-center rounded-lg bg-[#f2f4f6] px-2.5 py-1 text-xs font-bold text-muted border border-hairline/50">
          {l.propertyType}
        </div>
      </div>
      {/* Subtle inner shadow for image depth */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-ink/5" />
    </div>
  );

  return (
    <Link to={`/listings/${l.slug}`} aria-label={`${l.title} 상세보기`} className="group block h-full">
      <Card
        hoverable
        cover={cover}
        styles={{ body: { padding: 24 } }}
        className="h-full overflow-hidden rounded-3xl border border-hairline/80 bg-canvas transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-hairline hover:shadow-[var(--shadow-floating)]"
      >
        <h3 className="line-clamp-1 text-lg font-extrabold tracking-tight text-ink group-hover:text-brand transition-colors duration-200">{l.title}</h3>
        {l.addressPublic && l.address ? (
          <p className="mt-2 flex items-center gap-1.5 text-[0.9rem] font-semibold text-muted">
            <MapPin className="size-3.5 shrink-0 text-muted/60" aria-hidden="true" />
            <span className="line-clamp-1">{l.address}</span>
          </p>
        ) : null}
        <p className="mt-1 text-[0.85rem] font-medium text-muted/70">{formatArea(l.landAreaM2)}</p>
        <p className="mt-4 text-xl font-extrabold tracking-tight text-brand">{formatDealPrice(l)}</p>
      </Card>
    </Link>
  );
}
