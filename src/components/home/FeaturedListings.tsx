import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ListingCard } from '@/components/listings/ListingCard';
import type { Listing } from '@/lib/types';

export function FeaturedListings({ listings }: { listings: Listing[] }) {
  return (
    <section>
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">추천 매물</h2>
        {listings.length > 0 ? (
          <Link href="/listings" className="flex items-center gap-1 text-[0.95rem] font-bold text-brand transition-colors hover:text-brand-dark">
            더보기 <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      {listings.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-canvas px-6 py-16 text-center shadow-sm">
          <p className="text-lg font-bold text-ink">현재 등록된 매물이 없습니다.</p>
          <p className="mt-2 text-sm font-medium text-muted">찾으시는 조건이 있으면 전화 주세요. 바로 찾아드립니다.</p>
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
