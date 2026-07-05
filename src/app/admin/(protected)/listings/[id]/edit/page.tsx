import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ListingForm, type ListingFormInitialValues } from '@/components/admin/ListingForm';
import { getAdminListingById } from '@/lib/admin/listings';
import { wonToManwon } from '@/lib/admin/listing-schema';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function optionalString(value: number | string | null) {
  return value == null ? '' : String(value);
}

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await createServerSupabaseClient();
  const listing = await getAdminListingById(client, id);
  if (!listing) notFound();

  const initialValues: ListingFormInitialValues = {
    title: listing.title,
    propertyType: listing.propertyType,
    dealType: listing.dealType,
    address: listing.address,
    priceManwon: wonToManwon(listing.price),
    monthlyRentManwon: wonToManwon(listing.monthlyRent),
    landAreaM2: optionalString(listing.landAreaM2),
    buildingAreaM2: optionalString(listing.buildingAreaM2),
    zoning: optionalString(listing.zoning),
    landCategory: optionalString(listing.landCategory),
    roadAccess: optionalString(listing.roadAccess),
    ceilingHeightM: optionalString(listing.ceilingHeightM),
    powerCapacity: optionalString(listing.powerCapacity),
    completionYear: optionalString(listing.completionYear),
    lat: listing.lat,
    lng: listing.lng,
    description: optionalString(listing.description),
  };
  const initialImages = listing.imagePaths.map((path, index) => ({
    id: `stored-${index}-${path}`,
    path,
    previewUrl: listing.images[index] ?? '',
  }));

  return (
    <div className="space-y-7">
      <header>
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-brand">
          <ArrowLeft aria-hidden="true" className="size-4" /> 매물 목록
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-ink">매물 수정</h1>
        <p className="mt-2 text-muted">{listing.title} · 저장하면 공개 사이트에 바로 반영됩니다.</p>
      </header>
      <ListingForm
        mode="edit"
        listingId={listing.id}
        initialValues={initialValues}
        initialImages={initialImages}
      />
    </div>
  );
}
