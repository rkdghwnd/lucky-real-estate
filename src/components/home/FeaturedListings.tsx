import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ListingCard } from '@/components/listings/ListingCard';
import type { Listing } from '@/lib/types';

export function FeaturedListings({ listings }: { listings: Listing[] }) {
  if (listings.length === 0) return null;
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-ink">추천 매물</h2>
        <Link href="/listings" className="flex items-center gap-1 text-sm font-semibold text-brand transition hover:text-brand-dark">
          더보기 <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {listings.map(l => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}
