'use client';

import Image from 'next/image';
import { Phone } from 'lucide-react';
import { Button, Typography, Carousel } from 'antd';
import { PhoneConsultButton } from '@/components/layout/PhoneConsultButton';

// antd compound sub-components (Typography.Title/…) are only reachable inside a
// client component — across the server/client boundary `Typography` is an opaque
// reference and `.Title` resolves to undefined.
const { Title, Paragraph, Text } = Typography;

const BANNERS = ['/banner0.jpg','/banner5.avif', '/banner6.jpg', '/banner7.jpg'];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[380px] w-full sm:h-[440px] lg:h-[500px]">
        {/* Auto-sliding background banners */}
        <Carousel autoplay autoplaySpeed={4500} draggable className="absolute inset-0">
          {BANNERS.map((src, i) => (
            <div key={src}>
              <div className="relative h-[380px] w-full sm:h-[440px] lg:h-[500px]">
                <Image src={src} alt="" fill priority={i === 0} sizes="100vw" className="object-cover" />
              </div>
            </div>
          ))}
        </Carousel>
        {/* Readability gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent" />
        {/* Static text overlay */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-4 md:px-6">
          <div className="mb-5 inline-flex self-start items-center rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-[0.1em] text-white/90 backdrop-blur-sm">
            인천 서구 공장·토지 전문 부동산
          </div>
          <Title
            level={1}
            style={{ margin: 0, color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
            className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.1]"
          >
            행운부동산 공인중개사사무소
          </Title>
          <Paragraph style={{ margin: '20px 0 0', color: 'rgba(255,255,255,0.8)' }} className="max-w-xl text-base font-medium sm:text-lg">
            수년간의 노하우와 철저한 현장 검증으로<br className="hidden sm:block" /> 고객의 비즈니스에 가장 적합한 매물을 찾아드립니다.
          </Paragraph>
          <div className="pointer-events-auto mt-8 flex flex-wrap gap-3">
            <PhoneConsultButton type="primary" size="large" icon={<Phone className="size-5" aria-hidden="true" />} className="h-12 px-6 text-base font-semibold shadow-lg shadow-brand/30">
              전화상담
            </PhoneConsultButton>
            <Button size="large" href="/listings" className="h-12 border-white/20 bg-white/10 px-6 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 hover:text-white">
              매물보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
