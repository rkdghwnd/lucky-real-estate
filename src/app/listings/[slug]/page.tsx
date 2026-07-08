import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { getAllListingSlugs, getListingBySlug } from '@/lib/listings';
import { buildListingMetadata, buildListingJsonLd, buildBreadcrumbJsonLd } from '@/lib/seo';
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
      <JsonLd data={buildBreadcrumbJsonLd([
        { name: '홈', path: '/' },
        { name: '매물검색', path: '/listings' },
        { name: l.title, path: `/listings/${l.slug}` },
      ])} />
      <Breadcrumb items={[{ label: '홈', href: '/' }, { label: '매물검색', href: '/listings' }, { label: '매물상세' }]} />

      <div className="mt-4 grid items-start gap-8 lg:grid-cols-[1fr_1.4fr]">
        <ImageSlider images={l.images} alt={l.title} />
        <div>
          <div className="flex gap-1.5">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-bold text-white ${l.dealType === '매매' ? 'bg-brand' : 'bg-emerald-600'}`}>{l.dealType}</span>
            <span className="rounded-lg bg-surface px-2.5 py-1 text-xs font-bold text-muted border border-hairline/60">{l.propertyType}</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:leading-[1.15]">{l.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-muted">
            <MapPin className="size-4 shrink-0 text-muted/60" aria-hidden="true" />
            {l.address}
          </p>
          <p className="mt-5 text-4xl font-extrabold tracking-tight text-brand">{formatDealPrice(l)}</p>
          {l.landAreaM2 != null && <p className="mt-1.5 text-sm font-semibold text-muted/80">{formatArea(l.landAreaM2)}</p>}

          <dl className="mt-6 divide-y divide-hairline-soft border-y border-hairline/65">
            {keyFacts
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="flex gap-4 py-3.5 text-sm">
                  <dt className="w-24 shrink-0 font-bold text-muted">{k}</dt>
                  <dd className="text-ink font-semibold">{v}</dd>
                </div>
              ))}
          </dl>

          <div className="mt-6">
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
