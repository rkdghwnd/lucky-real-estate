import Link from 'next/link';
import { siteConfig } from '@/lib/site';

export function CallPanel() {
  return (
    <section className="rounded-3xl border border-hairline bg-canvas" aria-labelledby="call-panel-title">
      <div className="border-b border-hairline px-5 py-4">
        <h2 id="call-panel-title" className="text-lg font-bold text-ink">매수 · 매도 문의</h2>
        <p className="mt-1 text-sm text-muted">궁금하신 점이 있으시면 언제든 연락 주세요.</p>
      </div>
      <div className="px-5 py-4">
        <a href={siteConfig.phoneHref} className="flex items-center gap-2 text-2xl font-bold text-ink transition hover:text-brand">
          📞 {siteConfig.phone}
        </a>
        <Link href="/listings" className="mt-4 flex h-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark">
          매물 보기
        </Link>
      </div>
    </section>
  );
}
