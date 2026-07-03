import Link from 'next/link';
import { getFeaturedListings } from '@/lib/listings';
import { ListingCard } from '@/components/listings/ListingCard';
import { PhoneModalTrigger } from '@/components/layout/PhoneModal';
import { siteConfig } from '@/lib/site';

// Next 16: bake Supabase reads at build → static HTML for the Naver bot.
export const dynamic = 'force-static';

export default async function HomePage() {
  const listings = await getFeaturedListings(6);
  return (
    <div className="space-y-12">
      <section className="py-8 text-center">
        <h1 className="text-3xl font-extrabold leading-snug text-ink sm:text-4xl">{siteConfig.positioning}</h1>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={siteConfig.phoneHref} className="rounded-xl bg-accent px-8 py-4 text-xl font-bold text-white">📞 지금 전화상담</a>
          <PhoneModalTrigger label="찾는 매물 문의" className="rounded-xl border-2 border-brand px-8 py-4 text-xl font-bold text-brand" />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">대표 매물</h2>
          <Link href="/listings" className="text-lg text-brand underline">전체 매물 보기</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      <section className="rounded-2xl bg-brand p-8 text-center text-white">
        <p className="text-2xl font-bold">여기 없는 물건이 더 많습니다</p>
        <p className="mt-2 text-lg opacity-90">네이버에 안 올라온 비공개 공장·토지, 전화로 바로 확인하세요.</p>
        <a href={siteConfig.phoneHref} className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-lg font-bold text-brand">📞 {siteConfig.phone}</a>
      </section>

      <section className="grid gap-4 text-center sm:grid-cols-3">
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">25년</p><p className="mt-1 text-muted">인천 현장 경력</p></div>
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">공장·창고·토지</p><p className="mt-1 text-muted">B2B 전문</p></div>
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">네트워크</p><p className="mt-1 text-muted">비공개 매물 연결</p></div>
      </section>
    </div>
  );
}
