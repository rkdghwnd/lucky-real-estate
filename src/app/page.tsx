import Link from 'next/link';
import { getFeaturedListings } from '@/lib/listings';
import { ListingCard } from '@/components/listings/ListingCard';
import { NaverMap } from '@/components/map/NaverMap';
import { CallPanel } from '@/components/layout/CallPanel';
import { siteConfig } from '@/lib/site';

// Next 16: bake Supabase reads at build for static HTML.
export const dynamic = 'force-static';

export default async function HomePage() {
  const listings = await getFeaturedListings(6);

  return (
    <div className="space-y-14">
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-h-[360px] overflow-hidden rounded-3xl border border-hairline">
          <NaverMap lat={null} lng={null} address={siteConfig.address} />
        </div>
        <CallPanel />
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between border-b border-hairline pb-3">
          <h2 className="text-2xl font-normal tracking-tight text-ink">추천 <span className="text-brand">매물</span></h2>
          <Link href="/listings" className="text-sm font-semibold text-brand transition hover:text-brand-dark">전체 매물 보기 →</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>
    </div>
  );
}
