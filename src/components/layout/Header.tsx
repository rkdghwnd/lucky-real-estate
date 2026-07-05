'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Phone, Menu, X, ChevronRight, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site';

const NAV_LINKS = [
  { href: '/', label: '홈' },
  { href: '/listings', label: '매물검색' },
  { href: '/listings?deal=매매', label: '매매' },
  { href: '/listings?deal=임대', label: '임대' },
  { href: '/about', label: '회사소개' },
] as const;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const close = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-canvas">
      {/* Utility bar — desktop only */}
      <div className="hidden border-b border-hairline bg-brand-light md:block">
        <div className="mx-auto flex h-9 max-w-6xl items-center justify-between px-4 text-xs text-muted">
          <span className="truncate">{siteConfig.address}</span>
          <div className="flex items-center gap-4">
            <a href={siteConfig.phoneHref} className="inline-flex items-center gap-1.5 transition hover:text-brand">
              <span>문의</span>
              <span className="font-semibold text-ink">{siteConfig.phone}</span>
            </a>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {siteConfig.businessHours}
            </span>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-hairline">
        <div className="mx-auto flex min-h-[64px] max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label={siteConfig.shortName}>
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand text-white">
              <Building2 className="size-5" aria-hidden="true" />
            </span>
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="truncate text-xl font-bold tracking-tight text-ink">{siteConfig.shortName}</span>
              <span className="hidden whitespace-nowrap text-xs font-medium text-muted lg:inline">
                공장·창고·토지 전문 중개
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-[0.95rem] font-medium text-ink md:flex" aria-label="주요 메뉴">
            {NAV_LINKS.map(link => (
              <Link key={link.label} href={link.href} className="transition hover:text-brand">
                {link.label}
              </Link>
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
      </div>

      {mobileMenuOpen ? (
        <nav
          id="mobile-primary-navigation"
          aria-label="모바일 메뉴"
          className="fixed inset-0 z-50 flex flex-col bg-canvas md:hidden"
        >
          <div className="flex min-h-[64px] items-center justify-between border-b border-hairline px-4">
            <span className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-brand text-white">
                <Building2 className="size-4" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold tracking-tight text-ink">{siteConfig.shortName}</span>
            </span>
            <Button type="button" variant="outline" size="icon" onClick={close} aria-label="메뉴 닫기">
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>

          <div className="flex items-center gap-2 border-b border-hairline px-4 py-3 text-sm text-muted">
            <a href={siteConfig.phoneHref} className="inline-flex items-center gap-1.5">
              <span>문의</span>
              <span className="font-semibold text-brand">{siteConfig.phone}</span>
            </a>
            <span className="text-hairline">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {siteConfig.businessHours}
            </span>
          </div>

          <div className="flex flex-col divide-y divide-hairline px-4">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
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
