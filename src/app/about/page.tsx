import type { Metadata } from 'next';
import { Descriptions } from 'antd';
import { siteConfig } from '@/lib/site';
import { OfficeCarousel } from '@/components/about/OfficeCarousel';

export const metadata: Metadata = {
  title: '회사소개',
  description: `${siteConfig.name}. 인천 서구 공장·창고·토지 전문 네트워크.`,
  alternates: { canonical: `${siteConfig.siteUrl}/about` },
};



const OFFICE: [string, string][] = [
  ['상호', siteConfig.name],
  ['대표', siteConfig.representative],
  ['중개등록번호', siteConfig.registrationNumber],
  ['소재지', siteConfig.address],
  ['전화번호', siteConfig.phone],
  ['영업시간', siteConfig.businessHours],
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-hairline bg-[#f5f6f8]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">회사소개</h1>
          <p className="mt-3 max-w-xl text-muted sm:text-lg">정확하고 신뢰할 수 있는 거래를 제공하는 인천 서구 전문 부동산</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">
        <section>
          <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-[1.7rem]">
            행운부동산은 인천 서구 공장·창고·토지 전문 부동산입니다.
          </h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted">
            인천 서구 오류동·검단 일대의 공장·창고·토지 매물을 전문으로 중개합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">사무소 정보</h2>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
            <Descriptions
              bordered
              column={1}
              items={OFFICE.map(([k, v]) => ({ key: k, label: k, children: v }))}
            />
            <OfficeCarousel />
          </div>
        </section>
      </div>
    </div>
  );
}
