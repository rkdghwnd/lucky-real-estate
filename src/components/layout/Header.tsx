'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Phone, Menu, X, ChevronRight, Clock, Building2 } from 'lucide-react';
import { Button, Drawer } from 'antd';
import { siteConfig } from '@/lib/site';
import { PhoneModal } from './PhoneModal';

const NAV_LINKS = [
  { href: '/', label: '홈' },
  { href: '/listings', label: '매물검색' },
  { href: '/listings?deal=매매', label: '매매' },
  { href: '/listings?deal=임대', label: '임대' },
  { href: '/about', label: '회사소개' },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-canvas">
      {/* Utility bar — desktop only */}
      <div className="hidden border-b border-hairline bg-[#f5f6f8] md:block">
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
            <span className="flex min-w-0 items-baseline gap-2">
              <span className="truncate text-2xl font-bold tracking-tight text-ink">{siteConfig.shortName}</span>
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
            <Button
              type="primary"
              size="large"
              onClick={() => setPhoneOpen(true)}
              icon={<Phone className="size-4" aria-hidden="true" />}
              className="hidden sm:inline-flex"
            >
              전화상담
            </Button>
            <Button
              type="text"
              aria-label="메뉴"
              onClick={() => setOpen(true)}
              icon={<Menu className="size-5" aria-hidden="true" />}
              className="md:hidden"
            />
          </div>
        </div>
      </div>

      <Drawer
        open={open}
        onClose={close}
        placement="right"
        closable={false}
        styles={{ body: { padding: 0 } }}
        title={
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-brand text-white">
                <Building2 className="size-4" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold tracking-tight text-ink">{siteConfig.shortName}</span>
            </span>
            <Button type="text" aria-label="메뉴 닫기" onClick={close} icon={<X className="size-5" aria-hidden="true" />} />
          </div>
        }
      >
        <nav aria-label="모바일 메뉴" className="flex h-full flex-col bg-canvas">
          <a href={siteConfig.phoneHref} className="flex items-center gap-2 border-b border-hairline px-4 py-3 text-sm text-muted">
            <span>문의</span>
            <span className="font-semibold text-brand">{siteConfig.phone}</span>
            <span className="text-hairline">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden="true" />
              {siteConfig.businessHours}
            </span>
          </a>

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
            <Button type="primary" size="large" block icon={<Phone className="size-5" aria-hidden="true" />} onClick={() => { close(); setPhoneOpen(true); }}>
              전화상담
            </Button>
          </div>
        </nav>
      </Drawer>

      <PhoneModal open={phoneOpen} onClose={() => setPhoneOpen(false)} />
    </header>
  );
}
