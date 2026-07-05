import { getPublishedListings } from '@/lib/listings';
import { availableRegions } from '@/lib/search';
import { Hero } from '@/components/home/Hero';
import { SearchBar } from '@/components/home/SearchBar';
import { FeaturedListings } from '@/components/home/FeaturedListings';
import { HomeCta } from '@/components/home/HomeCta';
import { TrustStrip } from '@/components/home/TrustStrip';

// Next 16: bake Supabase reads at build for static HTML.
export const dynamic = 'force-static';

export default async function HomePage() {
  const listings = await getPublishedListings();
  const regions = availableRegions(listings);
  return (
    <div>
      <Hero />
      <div className="mx-auto max-w-6xl space-y-12 px-4 pb-16">
        <div className="relative z-10 -mt-8">
          <SearchBar regions={regions} />
        </div>
        <FeaturedListings listings={listings.slice(0, 4)} />
        <HomeCta />
        <TrustStrip />
      </div>
    </div>
  );
}
