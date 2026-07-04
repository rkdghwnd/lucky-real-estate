import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllListingSlugs, getListingBySlug } from '@/lib/listings';
import { buildListingMetadata, buildListingJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { ImageSlider } from '@/components/listings/ImageSlider';
import { SpecTable } from '@/components/listings/SpecTable';
import { ShareButtons } from '@/components/listings/ShareButtons';
import { NaverMap } from '@/components/map/NaverMap';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';
export const dynamicParams = false;

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

  return (
    <article className="space-y-8">
      <JsonLd data={buildListingJsonLd(l)} />
      <h1 className="text-3xl font-normal tracking-tight text-ink">{l.title}</h1>
      <ImageSlider images={l.images} alt={l.title} />
      <SpecTable listing={l} />
      {l.description && <div className="whitespace-pre-line text-lg leading-8">{l.description}</div>}
      <NaverMap lat={l.lat} lng={l.lng} address={l.address} />
      <ShareButtons slug={l.slug} title={l.title} />
      <div className="rounded-3xl bg-surface-dark p-6 text-center text-white">
        <p className="text-xl font-normal tracking-tight">이 매물이 궁금하세요?</p>
        <p className="text-white/70">비슷한 조건의 매물도 함께 확인해 드립니다.</p>
        <a href={siteConfig.phoneHref} className="mt-3 inline-block rounded-full bg-white px-6 py-3 text-lg font-bold text-ink transition hover:bg-white/90">📞 이 매물 문의</a>
      </div>
    </article>
  );
}
