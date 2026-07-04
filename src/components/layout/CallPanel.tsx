import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { siteConfig } from '@/lib/site';

export function CallPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>매수 · 매도 문의</CardTitle>
        <CardDescription>궁금하신 점이 있으시면 언제든 연락 주세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <a href={siteConfig.phoneHref} className="flex items-center gap-2 text-2xl font-bold text-ink transition hover:text-brand">
          📞 {siteConfig.phone}
        </a>
        <Button asChild className="mt-4 w-full">
          <Link href="/listings">매물 보기</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
