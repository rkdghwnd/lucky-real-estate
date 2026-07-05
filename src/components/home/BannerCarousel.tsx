'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

const BANNERS = [1, 2, 3, 4].map(n => ({ src: `/banner${n}.jpg`, alt: `행운부동산 배너 ${n}` }));
const INTERVAL_MS = 5000;
const NAVER_PLACE_URL =
  'https://map.naver.com/p/search/%ED%96%89%EC%9A%B4%EB%B6%80%EB%8F%99%EC%82%B0%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC/place/1399368164?c=15.00,0,0,2,dh&placePath=%2Fhome%3Fbk_query%3D%ED%96%89%EC%9A%B4%EB%B6%80%EB%8F%99%EC%82%B0%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC%26entry%3Dbmp%26from%3Dmap%26fromPanelNum%3D2%26locale%3Dko%26svcName%3Dmap_pcv5%26searchText%3D%ED%96%89%EC%9A%B4%EB%B6%80%EB%8F%99%EC%82%B0%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC';

export function BannerCarousel() {
  const count = BANNERS.length;
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((n: number) => setI((n + count) % count), [count]);
  const next = useCallback(() => setI(v => (v + 1) % count), [count]);
  const prev = useCallback(() => setI(v => (v - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    const reduce =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const id = window.setInterval(() => setI(v => (v + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="행운부동산 홍보 배너"
      className="relative overflow-hidden rounded-md border border-hairline bg-surface-dark"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative h-56 w-full sm:h-72 lg:h-96">
        {BANNERS.map((b, idx) => (
          <a
            key={b.src}
            href={NAVER_PLACE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${b.alt}, 네이버 지도에서 보기`}
            aria-hidden={idx === i ? undefined : true}
            tabIndex={idx === i ? undefined : -1}
            className={`absolute inset-0 block transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            <Image src={b.src} alt="" aria-hidden="true" fill sizes="100vw" className="scale-110 object-cover opacity-40 blur-2xl" />
            <Image
              src={b.src}
              alt={b.alt}
              fill
              sizes="(max-width:1152px) 100vw, 1152px"
              className="object-contain"
              priority={idx === 0}
            />
          </a>
        ))}
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="이전 배너"
        className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-2xl text-white transition hover:bg-black/60"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="다음 배너"
        className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-2xl text-white transition hover:bg-black/60"
      >
        ›
      </button>

      <div className="absolute inset-x-0 bottom-1 flex justify-center">
        {BANNERS.map((b, idx) => (
          <button
            key={b.src}
            type="button"
            onClick={() => go(idx)}
            aria-label={`배너 ${idx + 1} 보기`}
            aria-current={idx === i ? 'true' : undefined}
            className="grid size-11 place-items-center"
          >
            <span className={`block size-3 rounded-full transition ${idx === i ? 'bg-white' : 'bg-white/50'}`} />
          </button>
        ))}
      </div>
    </section>
  );
}
