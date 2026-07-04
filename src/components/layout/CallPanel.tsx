import Link from 'next/link';
import { siteConfig } from '@/lib/site';

export function CallPanel() {
  return (
    <section className="rounded-xl border border-neutral-200/80 bg-white shadow-sm" aria-labelledby="call-panel-title">
      <div className="border-b border-neutral-100 px-5 py-4">
        <span className="flex h-1 w-9 rounded-full bg-gold" aria-hidden="true" />
        <h2 id="call-panel-title" className="mt-2 text-lg font-black text-ink">매수 · 매도 문의</h2>
        <p className="mt-1 text-sm text-muted">궁금하신 점이 있으시면 언제든 연락 주세요.</p>
      </div>
      <div className="px-5 py-4">
        <a href={siteConfig.phoneHref} className="flex items-center gap-2 text-2xl font-black text-brand transition hover:text-brand-dark">
          📞 {siteConfig.phone}
        </a>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/listings" className="flex h-11 items-center justify-center rounded-lg bg-brand text-sm font-black text-white transition hover:bg-brand-dark">
            매물 보기
          </Link>
       
        </div>
      </div>
    </section>
  );
}
