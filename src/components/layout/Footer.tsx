import Link from 'next/link';
import { siteConfig } from '@/lib/site';

export function Footer() {
  const mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(siteConfig.address)}`;
  return (
    <footer className="mt-16 bg-navy text-white/70">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 border-b border-white/10 pb-5 text-sm font-bold text-white/80">
          <Link href="/">홈</Link>
          <Link href="/listings">매물검색</Link>
          <Link href="/about">회사소개</Link>
        </nav>
        <div className="grid gap-6 py-6 text-sm leading-7 md:grid-cols-[1fr_260px]">
          <div>
            <p className="text-base font-black text-white">{siteConfig.name}</p>
            <p>대표: {siteConfig.representative} · 중개등록번호: {siteConfig.registrationNumber}</p>
            <p>소재지: {siteConfig.address}</p>
            <p>
              전화: <a href={siteConfig.phoneHref} className="font-bold text-gold transition hover:text-gold-dark">{siteConfig.phone}</a> · {siteConfig.businessHours}
            </p>
            <p className="mt-2">
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="text-gold underline transition hover:text-gold-dark">
                네이버 지도에서 사무소 위치 보기
              </a>
            </p>
          </div>
          <div className="rounded-lg bg-white/5 p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-white/50">대표번호</p>
            <a href={siteConfig.phoneHref} className="mt-1 block text-2xl font-black text-gold transition hover:text-gold-dark">
              {siteConfig.phone}
            </a>
            <p className="mt-1 text-white/60">조건별 매물 상담 가능</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
