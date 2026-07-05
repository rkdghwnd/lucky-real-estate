import { Phone, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site';

export function ContactBox({ title }: { title: string }) {
  const sms = `sms:${siteConfig.phone.replace(/-/g, '')}?body=${encodeURIComponent(`[${title}] 문의합니다.`)}`;
  return (
    <div className="rounded-lg border border-hairline bg-canvas p-5">
      <p className="text-sm font-bold text-ink">문의하기</p>
      <p className="mt-1 text-sm text-muted">{siteConfig.name}</p>
      <a href={siteConfig.phoneHref} className="mt-3 flex items-center gap-2 text-2xl font-extrabold text-brand transition hover:text-brand-dark">
        <Phone className="size-5" aria-hidden="true" />
        {siteConfig.phone}
      </a>
      <div className="mt-4 flex flex-col gap-2">
        <Button asChild size="lg">
          <a href={siteConfig.phoneHref}>
            <Phone className="size-5" aria-hidden="true" />
            전화 상담하기
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href={sms}>
            <MessageSquare className="size-5" aria-hidden="true" />
            문자 문의하기
          </a>
        </Button>
      </div>
    </div>
  );
}
