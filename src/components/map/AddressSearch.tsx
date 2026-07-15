import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from 'antd';
import { siteConfig } from '@/lib/site';

// Naver address search (geocoder): type a query, get candidate addresses with
// coordinates, pick one. Used in the admin form so the address + lat/lng are
// confirmed from a real Naver result rather than free text.

interface NaverAddress {
  roadAddress?: string;
  jibunAddress?: string;
  x: string;
  y: string;
}
interface NaverGeocodeResponse {
  v2?: { addresses: NaverAddress[] };
}
interface NaverMapsApi {
  Service?: {
    geocode: (opts: { query: string }, cb: (status: string, res: NaverGeocodeResponse) => void) => void;
    Status: { OK: string };
  };
}
interface NaverWindow {
  naver?: { maps?: NaverMapsApi };
}

export interface AddressCandidate {
  address: string;
  lat: number;
  lng: number;
}

// Loads the Naver Maps SDK (with geocoder) once and resolves when ready. Reuses
// the same script tag / global as NaverMap.
function ensureNaverGeocoder(): Promise<NaverMapsApi> {
  return new Promise((resolve, reject) => {
    const ready = (window as unknown as NaverWindow).naver?.maps;
    if (ready?.Service) {
      resolve(ready);
      return;
    }
    if (!siteConfig.naverMapClientId) {
      reject(new Error('네이버 지도 클라이언트 ID가 없습니다.'));
      return;
    }

    let attempts = 0;
    const waitForService = () => {
      const maps = (window as unknown as NaverWindow).naver?.maps;
      if (maps?.Service) {
        resolve(maps);
        return;
      }
      attempts += 1;
      if (attempts >= 100) {
        reject(new Error('네이버 지도 SDK 로딩 시간 초과'));
        return;
      }
      window.setTimeout(waitForService, 50);
    };

    let script = document.getElementById('naver-map-sdk') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'naver-map-sdk';
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${siteConfig.naverMapClientId}&submodules=geocoder`;
      script.async = true;
      script.addEventListener('error', () => reject(new Error('네이버 지도 SDK 로딩 실패')));
      document.body.appendChild(script);
    }
    waitForService();
  });
}

type SearchStatus = 'idle' | 'searching' | 'error' | 'empty';

export function AddressSearch({
  initial = '',
  onSelect,
}: {
  initial?: string;
  onSelect: (candidate: AddressCandidate) => void;
}) {
  const [query, setQuery] = useState(initial);
  const [results, setResults] = useState<AddressCandidate[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');

  async function search() {
    const q = query.trim();
    if (!q) return;
    setStatus('searching');
    setResults([]);
    try {
      const maps = await ensureNaverGeocoder();
      maps.Service!.geocode({ query: q }, (geocodeStatus, response) => {
        if (geocodeStatus !== maps.Service!.Status.OK) {
          setStatus('error');
          return;
        }
        const candidates = (response.v2?.addresses ?? [])
          .map(a => ({
            address: a.roadAddress || a.jibunAddress || q,
            lat: Number(a.y),
            lng: Number(a.x),
          }))
          .filter(c => Number.isFinite(c.lat) && Number.isFinite(c.lng));
        setResults(candidates);
        setStatus(candidates.length > 0 ? 'idle' : 'empty');
      });
    } catch {
      setStatus('error');
    }
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              search();
            }
          }}
          placeholder="도로명 또는 지번 주소로 검색"
          aria-label="주소 검색"
          className="h-12 w-full rounded-xl border border-hairline bg-white px-4 text-base text-ink outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/15"
        />
        <Button htmlType="button" size="large" onClick={search} icon={<Search className="size-4" aria-hidden="true" />}>
          검색
        </Button>
      </div>

      {status === 'searching' ? <p className="mt-2 text-sm text-muted">검색 중…</p> : null}
      {status === 'error' ? (
        <p className="mt-2 text-sm font-semibold text-danger">주소 검색에 실패했습니다. 네이버 지도(Geocoding) 설정을 확인해주세요.</p>
      ) : null}
      {status === 'empty' ? <p className="mt-2 text-sm text-muted">검색 결과가 없습니다. 주소를 더 정확히 입력해주세요.</p> : null}

      {results.length > 0 ? (
        <ul className="mt-2 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-white">
          {results.map((candidate, index) => (
            <li key={`${candidate.address}-${index}`}>
              <button
                type="button"
                onClick={() => {
                  onSelect(candidate);
                  setResults([]);
                  setQuery(candidate.address);
                }}
                className="block w-full px-4 py-3 text-left text-sm text-ink transition hover:bg-surface"
              >
                {candidate.address}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
