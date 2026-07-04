import type { Metadata } from 'next';
import { NaverMap } from '@/components/map/NaverMap';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: '회사소개',
  description: `${siteConfig.name} — 인천 서구에서 25년, 공장·창고·토지 전문 네트워크.`,
  alternates: { canonical: `${siteConfig.siteUrl}/about` },
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section>
        <p className="inline-block rounded-full bg-brand/10 px-3 py-1 text-sm font-black text-brand">회사소개</p>
        <h1 className="mt-3 text-3xl font-black text-ink">{siteConfig.shortName}</h1>
        <p className="mt-4 text-xl leading-8 text-muted">{siteConfig.positioning}</p>
      </section>

      <section className="rounded-xl border border-neutral-200/80 bg-brand-light p-8">
        <h2 className="text-2xl font-bold text-ink">인천 서구에서 25년</h2>
        <p className="mt-3 text-lg leading-8 text-muted">
          오류동·검단·왕길동 일대 공장·창고·토지를 25년간 현장에서 중개해 왔습니다.
        </p>
      </section>

      <section className="grid gap-4 text-center sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <p className="text-3xl font-extrabold text-brand">25년</p>
          <p className="mt-1 text-muted">인천 현장 경력</p>
        </div>
        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <p className="text-3xl font-extrabold text-brand">공장·창고·토지</p>
          <p className="mt-1 text-muted">B2B 전문</p>
        </div>
        <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
          <p className="text-3xl font-extrabold text-brand">조건별 상담</p>
          <p className="mt-1 text-muted">맞춤형 확인</p>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-ink">사무소 정보</h2>
        <dl className="grid gap-2 text-lg sm:grid-cols-2">
          <div><dt className="text-sm text-muted">상호</dt><dd className="font-medium">{siteConfig.name}</dd></div>
          <div><dt className="text-sm text-muted">대표</dt><dd className="font-medium">{siteConfig.representative}</dd></div>
          <div><dt className="text-sm text-muted">중개등록번호</dt><dd className="font-medium">{siteConfig.registrationNumber}</dd></div>
          <div><dt className="text-sm text-muted">소재지</dt><dd className="font-medium">{siteConfig.address}</dd></div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-muted">전화</dt>
            <dd>
              <a href={siteConfig.phoneHref} className="font-bold text-brand transition hover:text-brand-dark">{siteConfig.phone}</a>
              <span className="text-muted"> · {siteConfig.businessHours}</span>
            </dd>
          </div>
        </dl>
      </section>

      <NaverMap lat={null} lng={null} address={siteConfig.address} />

      <section className="rounded-xl bg-navy p-8 text-center text-white shadow-md">
        <p className="text-xl font-black">조용히 제값에 팔고 싶으신가요?</p>
        <p className="mt-1 text-white/70">25년 매수자 네트워크로 연결해 드립니다.</p>
        <a href={siteConfig.phoneHref} className="mt-4 inline-block rounded-lg bg-gold px-6 py-3 text-lg font-black text-navy-dark transition hover:bg-gold-dark">📞 {siteConfig.phone}</a>
      </section>
    </div>
  );
}
