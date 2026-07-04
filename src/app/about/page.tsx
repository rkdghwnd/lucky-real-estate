import type { Metadata } from 'next';
import { NaverMap } from '@/components/map/NaverMap';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: '회사소개',
  description: `${siteConfig.name}. 인천 서구 공장·창고·토지 전문 네트워크.`,
  alternates: { canonical: `${siteConfig.siteUrl}/about` },
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section>
        <p className="inline-block rounded-full bg-brand-light px-3 py-1 text-sm font-semibold text-brand">회사소개</p>
        <h1 className="mt-3 text-3xl font-normal tracking-tight text-ink">{siteConfig.shortName}</h1>
        <p className="mt-4 text-xl leading-8 text-muted">{siteConfig.positioning}</p>
      </section>

      <section className="rounded-3xl border border-hairline bg-canvas p-6">
        <h2 className="mb-4 text-2xl font-normal tracking-tight text-ink">사무소 정보</h2>
        <dl className="grid gap-2 text-lg sm:grid-cols-2">
          <div><dt className="text-sm text-muted">상호</dt><dd className="font-medium text-ink">{siteConfig.name}</dd></div>
          <div><dt className="text-sm text-muted">대표</dt><dd className="font-medium text-ink">{siteConfig.representative}</dd></div>
          <div><dt className="text-sm text-muted">중개등록번호</dt><dd className="font-medium text-ink">{siteConfig.registrationNumber}</dd></div>
          <div><dt className="text-sm text-muted">소재지</dt><dd className="font-medium text-ink">{siteConfig.address}</dd></div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-muted">전화</dt>
            <dd>
              <a href={siteConfig.phoneHref} className="font-semibold text-brand transition hover:text-brand-dark">{siteConfig.phone}</a>
              <span className="text-muted"> · {siteConfig.businessHours}</span>
            </dd>
          </div>
        </dl>
      </section>

      <NaverMap lat={null} lng={null} address={siteConfig.address} />
    </div>
  );
}
