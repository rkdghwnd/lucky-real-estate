'use client';
import { siteConfig } from '@/lib/site';

export function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const url = `${siteConfig.siteUrl}/listings/${slug}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('링크를 복사했습니다');
    } catch {
      prompt('아래 링크를 복사하세요', url);
    }
  };
  const sms = `sms:?body=${encodeURIComponent(`${title} ${url}`)}`;
  return (
    <div className="flex gap-2">
      <button type="button" onClick={copy} className="rounded-full border border-hairline px-5 py-3 text-lg font-medium transition hover:border-brand hover:text-brand">링크복사</button>
      <a href={sms} className="rounded-full border border-hairline px-5 py-3 text-lg font-medium transition hover:border-brand hover:text-brand">문자</a>
    </div>
  );
}
