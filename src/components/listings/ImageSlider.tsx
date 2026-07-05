'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function ImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-hairline bg-brand-light text-muted">
        사진 준비중
      </div>
    );
  }
  const prev = () => setI(v => (v - 1 + images.length) % images.length);
  const next = () => setI(v => (v + 1) % images.length);
  const navBtn =
    'absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition hover:bg-black/60';
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-hairline bg-brand-light">
        <Image src={images[i]} alt={`${alt} 사진 ${i + 1}`} fill sizes="(max-width:1024px) 100vw, 640px" className="object-cover" priority />
        {images.length > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="이전 사진" className={`${navBtn} left-3`}>
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={next} aria-label="다음 사진" className={`${navBtn} right-3`}>
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
              {i + 1} / {images.length}
            </span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => setI(idx)}
              aria-label={`사진 ${idx + 1} 보기`}
              aria-current={i === idx}
              className={`relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition ${i === idx ? 'border-brand' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
