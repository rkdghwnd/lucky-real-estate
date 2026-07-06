'use client';

import Image from 'next/image';
import { Carousel } from 'antd';

const BANNERS = ['/banner1.jpg', '/banner2.jpg', '/banner3.jpg', '/banner4.jpg'];

// Office/reference photos, auto-sliding. Mirrors the hero carousel but framed 4:3
// for the about page's info column.
export function OfficeCarousel() {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-brand-light">
      <Carousel autoplay autoplaySpeed={4000} draggable>
        {BANNERS.map((src, i) => (
          <div key={src}>
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={src}
                alt="행운부동산공인중개사사무소 사무소"
                fill
                sizes="(max-width:1024px) 100vw, 360px"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
