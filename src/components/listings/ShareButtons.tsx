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
      <button type="button" onClick={copy} className="rounded-lg border px-4 py-3 text-lg">링크복사</button>
      <a href={sms} className="rounded-lg border px-4 py-3 text-lg">문자</a>
    </div>
  );
}
