'use client';
import { useState } from 'react';
import Image from 'next/image';

export function ImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) {
    return <div className="flex aspect-video items-center justify-center rounded-xl bg-brand-light text-muted">사진 준비중</div>;
  }
  const prev = () => setI(v => (v - 1 + images.length) % images.length);
  const next = () => setI(v => (v + 1) % images.length);
  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-neutral-100 shadow-sm ring-1 ring-neutral-200/80">
        <Image src={images[i]} alt={`${alt} 사진 ${i + 1}`} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" priority />
        {images.length > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="이전 사진" className="absolute left-2 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-black/50 text-2xl text-white">‹</button>
            <button type="button" onClick={next} aria-label="다음 사진" className="absolute right-2 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-black/50 text-2xl text-white">›</button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((src, idx) => (
            <button key={src} type="button" onClick={() => setI(idx)} aria-label={`사진 ${idx + 1} 보기`} aria-current={i === idx}
                    className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition ${i === idx ? 'border-brand shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'}`}>
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
