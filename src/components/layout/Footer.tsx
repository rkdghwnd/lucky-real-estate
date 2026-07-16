import { Link } from 'react-router-dom';
import { siteConfig } from '@/lib/site';

export function Footer() {
  const mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(siteConfig.address)}`;
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-hairline bg-surface text-muted">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <p className="text-lg font-bold text-ink">{siteConfig.name}</p>
            <div className="text-sm leading-relaxed space-y-1">
              <p>{siteConfig.address}</p>
              <p>대표: {siteConfig.representative} · 사업자번호: {siteConfig.registrationNumber}</p>
              <p>
                전화:{' '}
                <a href={siteConfig.phoneHref} className="font-semibold text-brand transition-colors duration-200 hover:text-brand-dark">{siteConfig.phone}</a>
                {' '}· {siteConfig.businessHours}
              </p>
            </div>
          </div>
          <div className="md:text-right">
            <p className="text-sm font-bold text-ink">바로가기</p>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm md:items-end font-medium">
              <Link to="/" className="transition-colors duration-200 hover:text-ink">홈</Link>
              <Link to="/listings" className="transition-colors duration-200 hover:text-ink">매물검색</Link>
              <Link to="/about" className="transition-colors duration-200 hover:text-ink">회사소개</Link>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="transition-colors duration-200 hover:text-ink">
                네이버 지도에서 사무소 위치 보기
              </a>
              <Link to="/admin/login" className="transition-colors duration-200 hover:text-ink">로그인</Link>
            </nav>
          </div>
        </div>
        <div className="mt-12 border-t border-hairline pt-6 text-xs text-muted/80">
          © {year} {siteConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
