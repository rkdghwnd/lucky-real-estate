import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { Button, Carousel } from 'antd';
import { PhoneConsultButton } from '@/components/layout/PhoneConsultButton';
import { withBase } from '@/lib/asset';

const BANNERS = ['/banner0.jpg', '/banner5.avif', '/banner6.jpg', '/banner7.jpg'].map(withBase);

export function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-gradient-to-tr from-brand-light/20 via-canvas to-canvas border-b border-hairline/40">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          {/* Text content - left side */}
          <div className="flex flex-col justify-center lg:col-span-6">
            <div className="mb-4 inline-flex self-start items-center rounded-md bg-brand-light px-3.5 py-1.5 text-xs font-bold tracking-tight text-brand">
              인천 서구 공장·창고·토지 전문
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl lg:leading-[1.15]">
              행운부동산<br />
              <span className="text-brand">공인중개사사무소</span>
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-muted sm:text-lg">
              25년간의 중개 노하우와 철저한 현장 검증을 통해<br className="hidden sm:block" />
              고객님이 필요한 매물을 정직하게 찾아드립니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PhoneConsultButton
                type="primary"
                size="large"
                icon={<Phone className="size-5" aria-hidden="true" />}
                className="h-12 px-6 rounded-xl text-base font-bold shadow-none hover:scale-[1.02] transition-transform duration-200"
              >
                전화상담
              </PhoneConsultButton>
              <Button
                size="large"
                onClick={() => navigate('/listings')}
                className="h-12 px-6 rounded-xl text-base font-bold bg-surface border-0 text-ink hover:bg-hairline hover:text-ink hover:scale-[1.02] transition-all duration-200"
              >
                매물보기
              </Button>
            </div>
          </div>

          {/* Visual container - right side */}
          <div className="flex items-center justify-center lg:col-span-6">
            <div className="relative w-full max-w-[480px] lg:max-w-none overflow-hidden rounded-3xl border border-hairline/50 bg-canvas shadow-[var(--shadow-floating)] hover:shadow-2xl transition-shadow duration-300">
              <Carousel autoplay autoplaySpeed={4500} draggable dots className="hero-carousel">
                {BANNERS.map((src, i) => (
                  <div key={src}>
                    <div className="relative aspect-[4/3] w-full">
                      <img
                        src={src}
                        alt="행운부동산 중개 물건"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </Carousel>
              {/* Overlay highlight border */}
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-ink/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
