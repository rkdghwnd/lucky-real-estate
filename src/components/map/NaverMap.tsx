'use client';
import { useEffect, useRef } from 'react';
import { siteConfig } from '@/lib/site';

export function NaverMap({ lat, lng, address }: { lat: number | null; lng: number | null; address: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const hasKey = Boolean(siteConfig.naverMapClientId);
  const searchUrl = `https://map.naver.com/p/search/${encodeURIComponent(address)}`;

  useEffect(() => {
    if (!hasKey || lat == null || lng == null || !ref.current) return;
    const init = () => {
      const naver = (window as unknown as { naver?: { maps?: any } }).naver;
      if (!naver?.maps || !ref.current) return;
      const center = new naver.maps.LatLng(lat, lng);
      const map = new naver.maps.Map(ref.current, { center, zoom: 16 });
      new naver.maps.Marker({ position: center, map });
    };
    if ((window as unknown as { naver?: { maps?: unknown } }).naver?.maps) { init(); return; }
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
  }, [hasKey, lat, lng]);

  if (!hasKey || lat == null || lng == null) {
    return (
      <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl border bg-gray-50 p-6 text-center text-lg">
        📍 {address}<br /><span className="text-brand underline">네이버 지도에서 위치 보기</span>
      </a>
    );
  }
  return <div ref={ref} className="h-72 w-full overflow-hidden rounded-xl bg-gray-100" aria-label={`${address} 지도`} />;
}
