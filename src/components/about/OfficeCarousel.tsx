'use client';

import Image from 'next/image';
import { Carousel } from 'antd';

const BANNERS = ['/banner1.jpg', '/banner2.jpg', '/banner3.jpg', '/banner4.jpg'];

// A self-contained 4:3 banner carousel. The frame owns its aspect ratio so the
// image (fill + object-cover) always covers it edge to edge. The about grid uses
// items-start so this box is never stretched past its 4:3 height (which would
// leave a gap under the image).
export function OfficeCarousel() {
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline/80 bg-brand-light/30 shadow-sm">
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
