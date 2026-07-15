import { ListingBrowser } from '@/components/listings/ListingBrowser';
import { useListings } from '@/lib/queries';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

export function Listings() {
  useDocumentTitle('매물검색 | 행운부동산');
  const { data: listings = [], isLoading, isError } = useListings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-ink sm:text-3xl">매물검색</h1>
      {isError ? (
        <div className="grid min-h-[400px] place-items-center text-muted font-semibold">
          매물을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </div>
      ) : isLoading ? (
        <div className="grid min-h-[400px] place-items-center text-muted">불러오는 중…</div>
      ) : (
        <ListingBrowser listings={listings} />
      )}
    </div>
  );
}
