import { Hero } from '@/components/home/Hero';
import { HomeSearchSidebar } from '@/components/home/HomeSearchSidebar';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { HomeCta } from '@/components/home/HomeCta';
import { AreaCalculator } from '@/components/home/AreaCalculator';
import { UsefulLinks } from '@/components/home/UsefulLinks';
import { useListings } from '@/lib/queries';
import { availableRegions } from '@/lib/search';

export function Home() {
  const { data: listings = [], isLoading } = useListings();
  const regions = availableRegions(listings);

  return (
    <div>
      <Hero />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        {/* 3 columns: search filter (left, sticky) · featured (center) · tools (right, sticky).
            Content-first DOM order → on mobile stacks featured → filter → tools. */}
        <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)_15rem] lg:items-start">
          <div className="space-y-12 lg:order-2">
            {isLoading ? (
              <div className="min-h-[420px]" aria-hidden />
            ) : (
              <FeaturedListings listings={listings.slice(0, 4)} />
            )}
            <HomeCta />
          </div>
          <aside className="lg:order-1 lg:sticky lg:top-24" aria-label="매물 검색 필터">
            <HomeSearchSidebar regions={regions} />
          </aside>
          <aside className="space-y-4 lg:order-3 lg:sticky lg:top-24">
            <AreaCalculator />
            <UsefulLinks />
          </aside>
        </div>
      </div>
    </div>
  );
}
