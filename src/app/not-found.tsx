import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h1 className="text-3xl font-normal tracking-tight text-ink">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-muted">주소가 바뀌었거나 매물이 내려갔을 수 있습니다.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Button asChild variant="outline-brand" size="lg">
          <Link href="/listings">매물 보기</Link>
        </Button>
        <Button asChild size="lg">
          <a href={siteConfig.phoneHref}>📞 전화상담</a>
        </Button>
      </div>
    </div>
  );
}
