import Image from 'next/image';
import Link from 'next/link';
import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site';

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[380px] w-full sm:h-[440px] lg:h-[500px]">
        <Image src="/banner1.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/55 to-ink/10" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4">
          <p className="text-sm font-semibold tracking-wide text-white/90 sm:text-base">
            인천 서구 공장·토지 전문 부동산
          </p>
          <h1 className="mt-2 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            행운부동산
          </h1>
          <p className="mt-4 max-w-lg leading-relaxed text-white/85 sm:text-lg">
            공장·창고·토지 전문 중개로 최적의 매물을 찾아드립니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Button asChild size="lg">
              <a href={siteConfig.phoneHref}>
                <Phone className="size-5" aria-hidden="true" />
                전화상담
              </a>
            </Button>
            <Button asChild size="lg" variant="onDark">
              <Link href="/listings">매물보기</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
