'use client';

import Image from 'next/image';
import { Phone } from 'lucide-react';
import { Button, Typography, Carousel } from 'antd';
import { PhoneConsultButton } from '@/components/layout/PhoneConsultButton';

// antd compound sub-components (Typography.Title/…) are only reachable inside a
// client component — across the server/client boundary `Typography` is an opaque
// reference and `.Title` resolves to undefined.
const { Title, Paragraph, Text } = Typography;

const BANNERS = ['/banner1.jpg', '/banner2.jpg', '/banner3.jpg'];

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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/50 to-ink/10" />
        {/* Static text overlay */}
        <div className="pointer-events-none relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-4">
          <Text style={{ color: 'rgba(255,255,255,0.9)' }} className="text-sm font-semibold tracking-wide sm:text-base">
            인천 서구 공장·토지 전문 부동산
          </Text>
          <Title
            level={1}
            style={{ margin: '8px 0 0', color: '#fff' }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            행운부동산 공인중개사사무소
          </Title>
          <Paragraph style={{ margin: '16px 0 0', color: 'rgba(255,255,255,0.85)' }} className="max-w-lg sm:text-lg">
            공장·창고·토지 전문 중개로 최적의 매물을 찾아드립니다.
          </Paragraph>
          <div className="pointer-events-auto mt-7 flex flex-wrap gap-2.5">
            <PhoneConsultButton type="primary" size="large" icon={<Phone className="size-5" aria-hidden="true" />}>
              전화상담
            </PhoneConsultButton>
            <Button size="large" href="/listings">
              매물보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
