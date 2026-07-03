import Link from 'next/link';
import Image from 'next/image';
import type { Listing } from '@/lib/types';
import { formatArea, formatDealPrice } from '@/lib/format';

export function ListingCard({ listing: l }: { listing: Listing }) {
  return (
    <Link href={`/listings/${l.slug}`} className="block overflow-hidden rounded-xl border transition hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-gray-100">
        {l.images[0] ? (
          <Image src={l.images[0]} alt={l.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">사진 준비중</div>
        )}
        <span className="absolute left-2 top-2 rounded bg-brand px-2 py-1 text-sm text-white">{l.propertyType} · {l.dealType}</span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-lg font-bold text-ink">{l.title}</h3>
        <p className="text-muted">{l.address}</p>
        <p className="mt-1">{formatArea(l.landAreaM2)}</p>
        <p className="text-lg font-bold text-accent">{formatDealPrice(l)}</p>
      </div>
    </Link>
  );
}
