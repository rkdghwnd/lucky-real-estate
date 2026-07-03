import type { Metadata } from 'next';
import { getPublishedListings } from '@/lib/listings';
import { ListingBrowser } from '@/components/listings/ListingBrowser';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '매물 목록',
  description: `인천 서구 오류동·검단 공장·창고·토지 매물. ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.siteUrl}/listings` },
};

export default async function ListingsPage() {
  const listings = await getPublishedListings();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold">매물 목록</h1>
      <ListingBrowser listings={listings} />
      <div className="mt-10 rounded-2xl bg-gray-50 p-8 text-center">
        <p className="text-xl font-bold">못 찾으셨나요?</p>
        <p className="mt-1 text-muted">전화 주시면 비공개 매물까지 찾아드립니다.</p>
        <a href={siteConfig.phoneHref} className="mt-4 inline-block rounded-xl bg-accent px-6 py-3 text-lg font-bold text-white">📞 {siteConfig.phone}</a>
      </div>
    </div>
  );
}
