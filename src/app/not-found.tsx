import Link from 'next/link';
import { siteConfig } from '@/lib/site';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-normal tracking-tight text-ink">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-muted">주소가 바뀌었거나 매물이 내려갔을 수 있습니다.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/listings" className="rounded-full border-2 border-brand px-6 py-3 text-lg font-semibold text-brand">매물 보기</Link>
        <a href={siteConfig.phoneHref} className="rounded-full bg-brand px-6 py-3 text-lg font-bold text-white transition hover:bg-brand-dark">📞 전화상담</a>
      </div>
    </div>
  );
}
