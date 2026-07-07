import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ListingCard } from '@/components/listings/ListingCard';
import type { Listing } from '@/lib/types';

export function FeaturedListings({ listings }: { listings: Listing[] }) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-ink">추천 매물</h2>
        {listings.length > 0 ? (
          <Link href="/listings" className="flex items-center gap-1 text-sm font-semibold text-brand transition hover:text-brand-dark">
            더보기 <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hairline bg-canvas px-6 py-14 text-center">
          <p className="text-lg font-bold text-ink">현재 등록된 매물이 없습니다.</p>
          <p className="mt-1.5 text-muted">찾으시는 조건이 있으면 전화 주세요. 바로 찾아드립니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {listings.map(l => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </section>
  );
}
