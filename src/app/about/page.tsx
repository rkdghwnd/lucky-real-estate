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
        <h1 className="text-3xl font-extrabold">회사소개</h1>
        <p className="mt-4 text-xl leading-8">{siteConfig.positioning}</p>
      </section>

      <section className="rounded-2xl bg-gray-50 p-8">
        <h2 className="text-2xl font-bold">인천 서구에서 25년</h2>
        <p className="mt-3 text-lg leading-8 text-muted">
          오류동·검단·왕길동 일대 공장·창고·토지를 25년간 현장에서 중개해 왔습니다.
          데이터앱이 알 수 없는 &ldquo;왜 파는지, 얼마까지 되는지, 옆 필지가 어떻게 되는지&rdquo;를
          네트워크로 압니다. 네이버에 올라오지 않는 비공개 매물까지 연결합니다.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3 text-center">
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">25년</p><p className="mt-1 text-muted">인천 현장 경력</p></div>
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">공장·창고·토지</p><p className="mt-1 text-muted">B2B 전문</p></div>
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">비공개 매물</p><p className="mt-1 text-muted">네트워크 연결</p></div>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-bold">사무소 정보</h2>
        <p className="text-lg">상호: {siteConfig.name}</p>
        <p className="text-lg">대표: {siteConfig.representative}</p>
        <p className="text-lg">중개등록번호: {siteConfig.registrationNumber}</p>
        <p className="text-lg">소재지: {siteConfig.address}</p>
        <p className="text-lg">전화: <a href={siteConfig.phoneHref} className="font-bold text-accent">{siteConfig.phone}</a> · {siteConfig.businessHours}</p>
      </section>

      <NaverMap lat={null} lng={null} address={siteConfig.address} />

      <section className="rounded-2xl bg-brand p-8 text-center text-white">
        <p className="text-xl font-bold">조용히 제값에 팔고 싶으신가요?</p>
        <p className="mt-1 opacity-90">25년 매수자 네트워크로 연결해 드립니다.</p>
        <a href={siteConfig.phoneHref} className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-lg font-bold text-brand">📞 {siteConfig.phone}</a>
      </section>
    </div>
  );
}
