import type { Metadata } from 'next';
import Image from 'next/image';
import { Card, Descriptions } from 'antd';
import { Building2, Target, Zap, Handshake } from 'lucide-react';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: '회사소개',
  description: `${siteConfig.name}. 인천 서구 공장·창고·토지 전문 네트워크.`,
  alternates: { canonical: `${siteConfig.siteUrl}/about` },
};

const FEATURES = [
  { icon: Building2, title: '전문성', desc: '공장·창고·토지 전문 중개로 조건에 맞는 매물을 정확히 매칭합니다.' },
  { icon: Target, title: '정확함', desc: '정확한 매물 정보와 시세를 바탕으로 신뢰를 최우선으로 합니다.' },
  { icon: Zap, title: '신속함', desc: '신속한 매물 상담과 빠른 연결로 소중한 시간을 아껴드립니다.' },
  { icon: Handshake, title: '책임감', desc: '계약까지 성실히 책임지는 중개 서비스를 제공합니다.' },
] as const;

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
            인천 서구 오류동·검단 일대의 공장·창고·토지 매물을 전문으로 중개합니다. 네이버에 없는 물건까지, 조건에
            맞는 매물을 찾아 전화 한 통으로 편하게 연결해 드립니다.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <Card key={title}>
              <span className="grid size-12 place-items-center rounded-lg bg-brand-light text-brand">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-4 text-lg font-bold text-ink">{title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
            </Card>
          ))}
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-ink">사무소 정보</h2>
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Descriptions
              bordered
              column={1}
              items={OFFICE.map(([k, v]) => ({ key: k, label: k, children: v }))}
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-hairline bg-brand-light">
              <Image src="/banner1.jpg" alt="행운부동산 사무소" fill sizes="(max-width:1024px) 100vw, 360px" className="object-cover" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
