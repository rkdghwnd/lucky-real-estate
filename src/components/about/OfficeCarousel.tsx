import { Carousel } from 'antd';
import { withBase } from '@/lib/asset';

const BANNERS = ['/banner1.jpg', '/banner2.jpg', '/banner3.jpg', '/banner4.jpg'].map(withBase);

// A self-contained 4:3 banner carousel. The frame owns its aspect ratio so the
// image (absolute inset + object-cover) always covers it edge to edge.
export function OfficeCarousel() {
  return (
    <div className="overflow-hidden rounded-2xl border border-hairline/80 bg-brand-light/30 shadow-sm">
      <Carousel autoplay autoplaySpeed={4000} draggable>
        {BANNERS.map((src, i) => (
          <div key={src}>
            <div className="relative aspect-[4/3] w-full">
              <img
                src={src}
                alt="행운부동산공인중개사사무소 사무소"
                loading={i === 0 ? 'eager' : 'lazy'}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
