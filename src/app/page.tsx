import { Suspense } from 'react';
import { getPublishedListings } from '@/lib/listings';
import { ListingSearch } from '@/components/listings/ListingSearch';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { siteConfig } from '@/lib/site';

// Next 16: bake Supabase reads at build for static HTML.
export const dynamic = 'force-static';

export default async function HomePage() {
  const listings = await getPublishedListings();
  return (
    <div className="space-y-5">
      <BannerCarousel />
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{siteConfig.positioning}</h1>
        <p className="mt-1 text-muted">인천 서구 공장·창고·토지 매물을 조건별로 확인하고 전화로 편하게 문의하세요.</p>
      </section>
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <ListingSearch listings={listings} />
      </Suspense>
    </div>
  );
}
