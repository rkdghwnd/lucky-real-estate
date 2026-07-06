import Link from 'next/link';
import Image from 'next/image';
import { Card, Tag } from 'antd';
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
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-sm font-medium text-muted">사진 준비중</div>
      )}
      <div className="absolute left-3 top-3 flex gap-1.5">
        <Tag color={l.dealType === '매매' ? '#1677ff' : '#059669'} style={{ margin: 0 }}>
          {l.dealType}
        </Tag>
        <Tag style={{ margin: 0 }}>{l.propertyType}</Tag>
      </div>
    </div>
  );

  return (
    <Link href={`/listings/${l.slug}`} aria-label={`${l.title} 상세보기`} className="group block h-full">
      <Card
        hoverable
        cover={cover}
        styles={{ body: { padding: 16 } }}
        className="h-full transition-transform duration-200 hover:-translate-y-1"
      >
        <h3 className="line-clamp-1 text-base font-bold tracking-tight text-ink">{l.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{l.address}</span>
        </p>
        <p className="mt-1 text-sm text-muted">{formatArea(l.landAreaM2)}</p>
        <p className="mt-2 text-lg font-extrabold tracking-tight text-brand">{formatDealPrice(l)}</p>
      </Card>
    </Link>
  );
}
