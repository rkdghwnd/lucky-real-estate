'use client';
import Image from 'next/image';
import { Carousel } from 'antd';

export function ImageSlider({ images, alt }: { images: string[]; alt: string }) {
  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-3xl border border-hairline/80 bg-brand-light/30 text-muted font-bold">
        사진 준비중
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-hairline bg-canvas shadow-sm">
      <Carousel arrows draggable adaptiveHeight={false}>
        {images.map((src, idx) => (
          <div key={src}>
            <div className="relative aspect-[4/3] bg-brand-light">
              <Image
                src={src}
                alt={`${alt} 사진 ${idx + 1}`}
                fill
                sizes="(max-width:1024px) 100vw, 640px"
                className="object-cover"
                priority={idx === 0}
              />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
