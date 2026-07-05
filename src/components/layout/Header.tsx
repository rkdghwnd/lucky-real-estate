'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Phone, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site';

const NAV_LINKS = [
  { href: '/listings', label: '매물검색' },
  { href: '/listings?deal=매매', label: '매매' },
  { href: '/listings?deal=임대', label: '임대' },
  { href: '/about', label: '회사소개' },
] as const;

const ALL_LINKS = [{ href: '/', label: '홈' }, ...NAV_LINKS] as const;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const close = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas">
      <div className="mx-auto flex min-h-10 max-w-6xl items-center justify-between gap-3 px-4 text-sm font-medium text-muted">
        <a href={siteConfig.phoneHref} className="inline-flex items-center gap-2 py-1.5 transition hover:text-brand">
          <Phone className="size-4 text-brand" aria-hidden="true" />
          <span>문의</span>
          <span>{siteConfig.phone}</span>
        </a>
        <span className="hidden sm:inline">{siteConfig.businessHours}</span>
      </div>

      <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-4 border-t border-hairline px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={siteConfig.shortName}>
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand text-xl font-bold text-white">행</span>
          <span className="min-w-0 text-ink">
            <span className="block text-xs font-medium text-muted">공장·창고·토지 전문 중개</span>
            <span className="block truncate text-xl font-bold tracking-tight">{siteConfig.shortName}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-base font-medium text-ink md:flex" aria-label="주요 메뉴">
          <Link href="/" className="transition hover:text-brand">홈</Link>
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} className="transition hover:text-brand">{link.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex">
            <a href={siteConfig.phoneHref}>
              <Phone className="size-4" aria-hidden="true" />
              전화상담
            </a>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-navigation"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden"
            aria-label="메뉴"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {mobileMenuOpen ? (
        <nav
          id="mobile-primary-navigation"
          aria-label="모바일 메뉴"
          className="fixed inset-0 z-50 flex flex-col bg-canvas md:hidden"
        >
          <div className="flex min-h-[68px] items-center justify-between border-b border-hairline px-4">
            <span className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-md bg-brand text-base font-bold text-white">행</span>
              <span className="text-lg font-bold tracking-tight text-ink">{siteConfig.shortName}</span>
            </span>
            <Button type="button" variant="outline" size="icon" onClick={close} aria-label="메뉴 닫기">
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>

          <a href={siteConfig.phoneHref} className="flex items-center gap-2 border-b border-hairline px-4 py-3 text-sm text-muted">
            <Phone className="size-4 text-brand" aria-hidden="true" />
            <span>문의 {siteConfig.phone}</span>
            <span className="text-hairline">·</span>
            <span>{siteConfig.businessHours}</span>
          </a>

          <div className="flex flex-col divide-y divide-hairline px-4">
            {ALL_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className="flex items-center justify-between py-4 text-base font-semibold text-ink"
              >
                {link.label}
                <ChevronRight className="size-4 text-muted" aria-hidden="true" />
              </Link>
            ))}
          </div>

          <div className="mt-auto p-4">
            <Button asChild size="lg" className="w-full">
              <a href={siteConfig.phoneHref} onClick={close}>
                <Phone className="size-5" aria-hidden="true" />
                전화상담
              </a>
            </Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
