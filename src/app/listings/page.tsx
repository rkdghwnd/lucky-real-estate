import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getPublishedListings } from '@/lib/listings';
import { ListingSearch } from '@/components/listings/ListingSearch';
import { Button } from '@/components/ui/button';
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
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-8">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">매물검색</h1>
        <p className="mt-1 text-muted">종류·거래유형·평수·가격으로 좁혀 보세요.</p>
      </section>
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <ListingSearch listings={listings} />
      </Suspense>
      <div className="rounded-md bg-surface-dark p-6 text-center text-white">
        <p className="text-lg font-bold">못 찾으셨나요?</p>
        <p className="mt-1 text-white/70">전화 주시면 비공개 매물까지 찾아드립니다.</p>
        <Button asChild variant="onDark" size="lg" className="mt-3">
          <a href={siteConfig.phoneHref}>📞 {siteConfig.phone}</a>
        </Button>
      </div>
    </div>
  );
}
