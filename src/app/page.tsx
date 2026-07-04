import Link from 'next/link';
import { getFeaturedListings } from '@/lib/listings';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingsMap } from '@/components/map/ListingsMap';
import { CallPanel } from '@/components/layout/CallPanel';
import { siteConfig } from '@/lib/site';

// Next 16: bake Supabase reads at build for static HTML.
export const dynamic = 'force-static';

export default async function HomePage() {
  const listings = await getFeaturedListings(6);

  return (
    <div className="space-y-14">
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="min-h-[360px] overflow-hidden rounded-xl shadow-sm">
          <ListingsMap listings={listings} />
        </div>
        <CallPanel />
      </section>

      <section>
        <div className="mb-5 flex items-end justify-between border-b-2 border-navy pb-3">
          <h2 className="text-2xl font-black text-ink">추천 <span className="text-brand">매물</span></h2>
          <Link href="/listings" className="text-sm font-bold text-brand transition hover:text-brand-dark">전체 매물 보기 →</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      <section className="rounded-xl bg-gradient-to-br from-navy to-brand p-8 text-center text-white shadow-md sm:flex sm:items-center sm:justify-between sm:text-left">
        <div>
          <p className="text-2xl font-black">여기 없는 물건이 더 많습니다</p>
          <p className="mt-2 text-white/80">네이버에 안 올라온 비공개 공장·토지, 25년 네트워크로 바로 연결해 드립니다.</p>
        </div>
        <a href={siteConfig.phoneHref} className="mt-5 inline-block rounded-lg bg-gold px-7 py-3.5 text-lg font-black text-navy-dark transition hover:bg-gold-dark sm:mt-0">📞 {siteConfig.phone}</a>
      </section>

      <section className="grid gap-4 text-center sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <p className="text-3xl font-black text-brand">25년</p>
          <p className="mt-1 text-muted">인천 현장 네트워크</p>
        </div>
        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <p className="text-3xl font-black text-brand">공장·창고·토지</p>
          <p className="mt-1 text-muted">B2B 전문</p>
        </div>
        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <p className="text-3xl font-black text-brand">비공개 매물</p>
          <p className="mt-1 text-muted">네트워크 연결</p>
        </div>
      </section>
    </div>
  );
}
