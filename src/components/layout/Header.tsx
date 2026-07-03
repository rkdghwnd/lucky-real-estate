import Link from 'next/link';
import { siteConfig } from '@/lib/site';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-brand">{siteConfig.shortName}</Link>
        <nav className="hidden gap-5 text-lg sm:flex">
          <Link href="/listings">매물</Link>
          <Link href="/about">회사소개</Link>
        </nav>
        <a href={siteConfig.phoneHref} className="whitespace-nowrap text-lg font-bold text-accent">📞 {siteConfig.phone}</a>
      </div>
    </header>
  );
}
