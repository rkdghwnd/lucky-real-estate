'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { siteConfig } from '@/lib/site';
import { formatDealPrice } from '@/lib/format';
import type { Listing } from '@/lib/types';

interface NaverLatLng {
  lat: () => number;
  lng: () => number;
}
interface NaverMapInstance {
  setCenter: (latlng: unknown) => void;
  fitBounds: (bounds: unknown) => void;
}
interface NaverMapsApi {
  LatLng: new (lat: number, lng: number) => NaverLatLng;
  LatLngBounds: new () => { extend: (latlng: unknown) => void };
  Map: new (el: HTMLElement, options: Record<string, unknown>) => NaverMapInstance;
  Marker: new (options: Record<string, unknown>) => object;
  Event: { addListener: (target: unknown, type: string, cb: () => void) => void };
}
interface NaverWindow {
  naver?: { maps?: NaverMapsApi };
}

export function ListingsMap({ listings }: { listings: Listing[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const hasKey = Boolean(siteConfig.naverMapClientId);
  const located = listings.filter(l => l.lat != null && l.lng != null);

  useEffect(() => {
    if (!hasKey || !ref.current || located.length === 0) return;

    const init = () => {
      const maps = (window as unknown as NaverWindow).naver?.maps;
      if (!maps || !ref.current) return;
      const first = located[0];
      const map = new maps.Map(ref.current, {
        center: new maps.LatLng(first.lat as number, first.lng as number),
        zoom: 12,
      });
      const bounds = new maps.LatLngBounds();
      located.forEach(l => {
        const pos = new maps.LatLng(l.lat as number, l.lng as number);
        bounds.extend(pos);
        const marker = new maps.Marker({ position: pos, map });
        maps.Event.addListener(marker, 'click', () => {
          window.location.href = `/listings/${l.slug}`;
        });
      });
      if (located.length > 1) map.fitBounds(bounds);
    };

    if ((window as unknown as NaverWindow).naver?.maps) {
      init();
      return;
    }
    const id = 'naver-map-sdk';
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${siteConfig.naverMapClientId}`;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener('load', init);
    return () => script?.removeEventListener('load', init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasKey, listings]);

  if (!hasKey || located.length === 0) {
    return (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 rounded-3xl border border-hairline bg-brand-light p-6 text-center">
        <MapPin aria-hidden="true" className="size-8 text-muted" />
        <p className="text-sm font-bold text-ink">지도로 볼 수 있는 매물이 준비 중입니다</p>
        <p className="text-sm text-muted">아래 목록에서 매물을 확인하거나 전화로 문의해 주세요.</p>
        <div className="mt-1 flex flex-col gap-1">
          {located.slice(0, 4).map(l => (
            <Link key={l.id} href={`/listings/${l.slug}`} className="text-sm font-semibold text-brand underline">
              {l.title} · {formatDealPrice(l)}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return <div ref={ref} className="h-full min-h-[280px] w-full overflow-hidden rounded-3xl border border-hairline bg-neutral-100" aria-label="매물 지도" />;
}
