import type { Metadata } from 'next';
import { getPublishedListings } from '@/lib/listings';
import { ListingBrowser } from '@/components/listings/ListingBrowser';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '매물검색',
  description: `인천 서구 오류동·검단 공장·창고·토지 매물. ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.siteUrl}/listings` },
};

export default async function ListingsPage() {
  const listings = await getPublishedListings();
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <p className="inline-block rounded-full bg-brand/10 px-3 py-1 text-sm font-black text-brand">인천 서구 공장·창고·토지</p>
        <h1 className="mt-3 text-3xl font-black text-ink">매물검색</h1>
        <p className="mt-2 text-muted">조건을 고르거나 바로 전화 주시면 매물 조건을 함께 확인해 드립니다.</p>
      </section>
      <ListingBrowser listings={listings} />
      <div className="rounded-xl bg-navy p-8 text-center text-white shadow-sm">
        <p className="text-xl font-black">못 찾으셨나요?</p>
        <p className="mt-1 text-white/70">전화 주시면 비공개 매물까지 찾아드립니다.</p>
        <a href={siteConfig.phoneHref} className="mt-4 inline-block rounded-lg bg-gold px-6 py-3 text-lg font-black text-navy-dark transition hover:bg-gold-dark">📞 {siteConfig.phone}</a>
      </div>
    </div>
  );
}
