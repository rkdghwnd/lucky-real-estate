import type { Metadata } from 'next';
import { getPublishedListings } from '@/lib/listings';
import { ListingBrowser } from '@/components/listings/ListingBrowser';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '매물검색',
  description: `인천 서구 오류동·검단 공장·창고·토지 매물. ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.siteUrl}/listings` },
};

export default async function ListingsPage() {
  const listings = await getPublishedListings();
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <Badge variant="brand">인천 서구 공장·창고·토지</Badge>
        <h1 className="mt-3 text-3xl font-normal tracking-tight text-ink">매물검색</h1>
        <p className="mt-2 text-muted">조건을 고르거나 바로 전화 주시면 매물 조건을 함께 확인해 드립니다.</p>
      </Card>
      <ListingBrowser listings={listings} />
      <div className="rounded-3xl bg-surface-dark p-8 text-center text-white">
        <p className="text-xl font-normal tracking-tight">못 찾으셨나요?</p>
        <p className="mt-1 text-white/70">전화 주시면 비공개 매물까지 찾아드립니다.</p>
        <Button asChild variant="onDark" size="lg" className="mt-4">
          <a href={siteConfig.phoneHref}>📞 {siteConfig.phone}</a>
        </Button>
      </div>
    </div>
  );
}
