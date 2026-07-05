'use client';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

const BANNERS = [1, 2, 3, 4].map(n => ({ src: `/banner${n}.jpg`, alt: `행운부동산 배너 ${n}` }));
const INTERVAL_MS = 5000;

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
          <div
            key={b.src}
            className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            aria-hidden={idx === i ? undefined : true}
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
          </div>
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
