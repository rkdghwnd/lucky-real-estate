import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { getAllListingSlugs, getListingBySlug } from '@/lib/listings';
import { buildListingMetadata, buildListingJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { Breadcrumb } from '@/components/listings/Breadcrumb';
import { ImageSlider } from '@/components/listings/ImageSlider';
import { SpecTable } from '@/components/listings/SpecTable';
import { ContactBox } from '@/components/listings/ContactBox';
import { formatArea, formatDealPrice } from '@/lib/format';

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllListingSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = await getListingBySlug(slug);
  return l ? buildListingMetadata(l) : {};
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await getListingBySlug(slug);
  if (!l) notFound();

  const keyFacts: [string, string | null][] = [
    ['종류', `${l.propertyType} · ${l.dealType}`],
    ['소재지', l.address],
    ['대지면적', l.landAreaM2 != null ? formatArea(l.landAreaM2) : null],
    ['건물면적', l.buildingAreaM2 != null ? formatArea(l.buildingAreaM2) : null],
    ['지목', l.landCategory],
    ['도로', l.roadAccess],
  ];

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={buildListingJsonLd(l)} />
      <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '매물검색', href: '/listings' }, { label: '매물상세' }]} />

      <div className="mt-4 grid items-start gap-8 lg:grid-cols-[1fr_1.4fr]">
        <ImageSlider images={l.images} alt={l.title} />
        <div>
          <div className="flex gap-1.5">
            <span className={`rounded-md px-2.5 py-1 text-xs font-bold text-white ${l.dealType === '매매' ? 'bg-brand' : 'bg-emerald-600'}`}>{l.dealType}</span>
            <span className="rounded-md bg-ink px-2.5 py-1 text-xs font-bold text-white">{l.propertyType}</span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{l.title}</h1>
          <p className="mt-1.5 flex items-center gap-1 text-muted">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {l.address}
          </p>
          <p className="mt-4 text-3xl font-extrabold tracking-tight text-brand">{formatDealPrice(l)}</p>
          {l.landAreaM2 != null && <p className="mt-1 text-muted">{formatArea(l.landAreaM2)}</p>}

          <dl className="mt-5 divide-y divide-hairline border-y border-hairline">
            {keyFacts
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex gap-4 py-2.5 text-sm">
                  <dt className="w-20 shrink-0 font-semibold text-muted">{k}</dt>
                  <dd className="text-ink">{v}</dd>
                </div>
              ))}
          </dl>

          <div className="mt-5">
            <ContactBox />
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-xl font-bold text-ink">상세 정보</h2>
        <SpecTable listing={l} />
      </section>

      {l.description && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl font-bold text-ink">상세 설명</h2>
          <div className="whitespace-pre-line leading-8 text-ink">{l.description}</div>
        </section>
      )}
    </article>
  );
}
