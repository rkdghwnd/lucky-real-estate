import Link from 'next/link';
import { siteConfig } from '@/lib/site';

export function Footer() {
  const mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(siteConfig.address)}`;
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 bg-surface-dark text-white/70">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-lg font-bold text-white">{siteConfig.name}</p>
            <p className="mt-4 text-sm leading-7">{siteConfig.address}</p>
            <p className="text-sm leading-7">대표: {siteConfig.representative} · 중개등록번호: {siteConfig.registrationNumber}</p>
            <p className="text-sm leading-7">
              전화:{' '}
              <a href={siteConfig.phoneHref} className="text-white transition hover:underline">{siteConfig.phone}</a>
              {' '}· {siteConfig.businessHours}
            </p>
          </div>
          <div className="md:text-right">
            <p className="text-sm font-bold text-white">바로가기</p>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm md:items-end">
              <Link href="/" className="transition hover:text-white">홈</Link>
              <Link href="/listings" className="transition hover:text-white">매물검색</Link>
              <Link href="/about" className="transition hover:text-white">회사소개</Link>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                네이버 지도에서 사무소 위치 보기
              </a>
            </nav>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/50">
          © {year} {siteConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
