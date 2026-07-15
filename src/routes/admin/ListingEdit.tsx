import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAdminListing } from '@/lib/admin/queries';
import { ListingForm, type ListingFormInitialValues } from '@/components/admin/ListingForm';
import { wonToManwon } from '@/lib/admin/listing-schema';
import type { AdminListing } from '@/lib/admin/listings';
import type { StoredListingImage } from '@/lib/admin/images';

const numStr = (v: number | null) => (v == null ? '' : String(v));

function toInitialValues(l: AdminListing): ListingFormInitialValues {
  return {
    title: l.title,
    propertyType: l.propertyType,
    dealType: l.dealType,
    status: l.status === '거래완료' ? '거래완료' : '공개',
    address: l.address,
    addressPublic: l.addressPublic,
    priceManwon: wonToManwon(l.price),
    monthlyRentManwon: wonToManwon(l.monthlyRent),
    landAreaM2: numStr(l.landAreaM2),
    buildingAreaM2: numStr(l.buildingAreaM2),
    zoning: l.zoning ?? '',
    landCategory: l.landCategory ?? '',
    roadAccess: l.roadAccess ?? '',
    ceilingHeightM: numStr(l.ceilingHeightM),
    powerCapacity: l.powerCapacity ?? '',
    completionYear: numStr(l.completionYear),
    lat: l.lat,
    lng: l.lng,
    description: l.description ?? '',
  };
}

function toStoredImages(l: AdminListing): StoredListingImage[] {
  return l.imagePaths.map((path, i) => ({
    id: `stored-${i}`,
    path,
    previewUrl: l.images[i] ?? path,
  }));
}

export function AdminListingEdit() {
  const { id } = useParams();
  const { data: listing, isLoading, isError } = useAdminListing(id);

  useEffect(() => {
    document.title = '매물 수정';
  }, []);

  if (isLoading) {
    return <div className="grid min-h-64 place-items-center text-muted">불러오는 중…</div>;
  }
  if (isError || !listing) {
    return <div className="grid min-h-64 place-items-center font-semibold text-muted">매물을 찾을 수 없습니다.</div>;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black tracking-tight text-ink">매물 수정</h1>
      <ListingForm
        mode="edit"
        listingId={listing.id}
        initialValues={toInitialValues(listing)}
        initialImages={toStoredImages(listing)}
      />
    </div>
  );
}
