import { getPublishedListings } from '@/lib/listings';
import { availableRegions } from '@/lib/search';
import { Hero } from '@/components/home/Hero';
import { SearchBar } from '@/components/home/SearchBar';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { HomeCta } from '@/components/home/HomeCta';
import { AreaCalculator } from '@/components/home/AreaCalculator';
import { UsefulLinks } from '@/components/home/UsefulLinks';

// Next 16: bake Supabase reads at build for static HTML.
export const dynamic = 'force-static';

export default async function HomePage() {
  const listings = await getPublishedListings();
  const regions = availableRegions(listings);
  return (
    <div>
      <Hero />
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <div className="relative z-10 -mt-8">
          <SearchBar regions={regions} />
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="space-y-12">
            <FeaturedListings listings={listings.slice(0, 4)} />
            <HomeCta />
          </div>
          <aside className="space-y-4 lg:sticky lg:top-24">
            <AreaCalculator />
            <UsefulLinks />
          </aside>
        </div>
      </div>
    </div>
  );
}
