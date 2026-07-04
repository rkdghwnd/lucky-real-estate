'use client';
import { Button } from '@/components/ui/button';
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
      <Button type="button" variant="outline" size="lg" onClick={copy}>링크복사</Button>
      <Button asChild variant="outline" size="lg">
        <a href={sms}>문자</a>
      </Button>
    </div>
  );
}
