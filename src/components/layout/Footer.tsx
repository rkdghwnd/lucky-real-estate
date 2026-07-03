import { siteConfig } from '@/lib/site';

export function Footer() {
  const mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(siteConfig.address)}`;
  return (
    <footer className="mt-16 border-t bg-gray-50 text-muted">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm leading-7">
        <p className="text-base font-bold text-ink">{siteConfig.name}</p>
        <p>대표: {siteConfig.representative} · 중개등록번호: {siteConfig.registrationNumber}</p>
        <p>소재지: {siteConfig.address}</p>
        <p>전화: <a href={siteConfig.phoneHref} className="font-semibold text-accent">{siteConfig.phone}</a> · {siteConfig.businessHours}</p>
        <p className="mt-2"><a href={mapUrl} target="_blank" rel="noopener noreferrer" className="underline">네이버 지도에서 사무소 위치 보기</a></p>
      </div>
    </footer>
  );
}
