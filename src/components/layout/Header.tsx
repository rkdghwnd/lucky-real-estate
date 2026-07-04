'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site';

const NAV_LINKS = [
  { href: '/listings', label: '매물검색' },
  { href: '/about', label: '회사소개' },
] as const;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
      <div className="mx-auto flex min-h-10 max-w-6xl items-center justify-between gap-3 px-4 text-sm font-medium text-muted">
        <a href={siteConfig.phoneHref} className="inline-flex items-center gap-2 py-1.5 transition hover:text-brand">
          <span aria-hidden="true">📞</span>
          <span>문의</span>
          <span>{siteConfig.phone}</span>
        </a>
        <span className="hidden sm:inline">{siteConfig.businessHours}</span>
      </div>

      <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-4 border-t border-hairline px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={siteConfig.shortName}>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-xl font-bold text-white">행</span>
          <span className="min-w-0 text-ink">
            <span className="block text-xs font-medium text-muted">공장·창고·토지 전문 중개</span>
            <span className="block truncate text-xl font-bold tracking-tight">{siteConfig.shortName}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-base font-medium text-ink md:flex" aria-label="주요 메뉴">
          <Link href="/" className="transition hover:text-brand">홈</Link>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="transition hover:text-brand">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex">
            <a href={siteConfig.phoneHref}>📞 전화상담</a>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-navigation"
            onClick={() => setMobileMenuOpen(open => !open)}
            className="md:hidden"
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴'}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </Button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <nav id="mobile-primary-navigation" className="border-t border-hairline bg-canvas px-4 py-2 md:hidden" aria-label="모바일 메뉴">
          <div className="mx-auto grid max-w-6xl divide-y divide-hairline">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-3 text-base font-medium text-ink">홈</Link>
            {NAV_LINKS.map(link => (
              <Link key={`m-${link.href}`} href={link.href} onClick={() => setMobileMenuOpen(false)} className="py-3 text-base font-medium text-ink">
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
