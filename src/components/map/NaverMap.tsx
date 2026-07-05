'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { siteConfig } from '@/lib/site';

interface NaverGeocodeResponse {
  v2?: {
    addresses: Array<{ x: string; y: string }>;
  };
}

interface NaverMapsApi {
  LatLng: new (lat: number, lng: number) => unknown;
  Map: new (element: HTMLElement, options: { center: unknown; zoom: number }) => unknown;
  Marker: new (options: { position: unknown; map: unknown }) => unknown;
  Service?: {
    geocode: (
      options: { query: string },
      callback: (status: string, response: NaverGeocodeResponse) => void,
    ) => void;
    Status: { OK: string };
  };
}

interface NaverWindow {
  naver?: { maps?: NaverMapsApi };
}

type NaverAuthWindow = Window & { navermap_authFailure?: () => void };

type MapStatus = 'loading' | 'ready' | 'error';

export function NaverMap({
  lat,
  lng,
  address,
  onResolved,
}: {
  lat: number | null;
  lng: number | null;
  address: string;
  onResolved?: (position: { lat: number; lng: number }) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const hasKey = Boolean(siteConfig.naverMapClientId);
  const [status, setStatus] = useState<MapStatus>(hasKey ? 'loading' : 'error');

  useEffect(() => {
    let active = true;
    let script: HTMLScriptElement | null = null;
    let readyTimer: number | null = null;
    let readyAttempts = 0;

    if (!hasKey || !ref.current) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    const fail = () => {
      if (active) setStatus('error');
    };

    const authWindow = window as NaverAuthWindow;
    const previousAuthFailure = authWindow.navermap_authFailure;
    authWindow.navermap_authFailure = fail;

    const restoreAuthFailure = () => {
      if (authWindow.navermap_authFailure !== fail) return;
      if (previousAuthFailure) authWindow.navermap_authFailure = previousAuthFailure;
      else delete authWindow.navermap_authFailure;
    };

    const createMap = (mapLat: number, mapLng: number) => {
      const maps = (window as unknown as NaverWindow).naver?.maps;
      if (!active || !maps || !ref.current || !Number.isFinite(mapLat) || !Number.isFinite(mapLng)) return fail();

      const center = new maps.LatLng(mapLat, mapLng);
      const map = new maps.Map(ref.current, { center, zoom: 17 });
      new maps.Marker({ position: center, map });
      onResolved?.({ lat: mapLat, lng: mapLng });
      setStatus('ready');
    };

    const init = () => {
      const maps = (window as unknown as NaverWindow).naver?.maps;
      if (!maps) return fail();

      if (lat != null && lng != null) {
        createMap(lat, lng);
        return;
      }

      if (!maps.Service) return fail();
      maps.Service.geocode({ query: address }, (geocodeStatus, response) => {
        if (!active) return;
        const result = response?.v2?.addresses?.[0];
        const resultLat = Number(result?.y);
        const resultLng = Number(result?.x);

        if (
          geocodeStatus !== maps.Service?.Status.OK ||
          !result ||
          !Number.isFinite(resultLat) ||
          !Number.isFinite(resultLng)
        ) {
          fail();
          return;
        }

        createMap(resultLat, resultLng);
      });
    };

    const waitForSdk = () => {
      if (!active) return;
      const maps = (window as unknown as NaverWindow).naver?.maps;
      const needsGeocoder = lat == null || lng == null;

      if (maps && (!needsGeocoder || maps.Service)) {
        init();
        return;
      }

      readyAttempts += 1;
      if (readyAttempts >= 100) {
        fail();
        return;
      }
      readyTimer = window.setTimeout(waitForSdk, 50);
    };

    if ((window as unknown as NaverWindow).naver?.maps) {
      waitForSdk();
      return () => {
        active = false;
        if (readyTimer != null) window.clearTimeout(readyTimer);
        restoreAuthFailure();
      };
    }

    script = document.getElementById('naver-map-sdk') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'naver-map-sdk';
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${siteConfig.naverMapClientId}&submodules=geocoder`;
      script.async = true;
      document.body.appendChild(script);
    }

    script.addEventListener('error', fail);
    waitForSdk();
    return () => {
      active = false;
      if (readyTimer != null) window.clearTimeout(readyTimer);
      script?.removeEventListener('error', fail);
      restoreAuthFailure();
    };
  }, [address, hasKey, lat, lng, onResolved]);

  return (
    <div className="relative min-h-[360px] w-full overflow-hidden rounded-3xl border border-hairline bg-brand-light">
      <div ref={ref} className="min-h-[360px] w-full" aria-label={`${address} 지도`} />

      {status === 'loading' ? (
        <div className="absolute inset-0 grid place-items-center bg-brand-light text-sm font-semibold text-muted" role="status">
          지도 불러오는 중
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand-light p-6 text-center" role="alert">
          <MapPin aria-hidden="true" className="size-8 text-muted" />
          <p className="font-bold text-ink">지도를 불러오지 못했습니다</p>
          <p className="text-sm text-muted">{address}</p>
        </div>
      ) : null}
    </div>
  );
}
