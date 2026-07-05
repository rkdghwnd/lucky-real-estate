import { Phone, MessageSquare } from 'lucide-react';
import { Card, Button } from 'antd';
import { siteConfig } from '@/lib/site';

export function ContactBox({ title }: { title: string }) {
  const sms = `sms:${siteConfig.phone.replace(/-/g, '')}?body=${encodeURIComponent(`[${title}] 문의합니다.`)}`;
  return (
    <Card styles={{ body: { padding: 20 } }}>
      <p className="text-sm font-bold text-ink">문의하기</p>
      <p className="mt-1 text-sm text-muted">{siteConfig.name}</p>
      <a href={siteConfig.phoneHref} className="mt-3 flex items-center gap-2 text-2xl font-extrabold text-brand transition hover:text-brand-dark">
        <Phone className="size-5" aria-hidden="true" />
        {siteConfig.phone}
      </a>
      <div className="mt-4 flex flex-col gap-2">
        <Button type="primary" size="large" block href={siteConfig.phoneHref} icon={<Phone className="size-5" aria-hidden="true" />}>
          전화 상담하기
        </Button>
        <Button size="large" block href={sms} icon={<MessageSquare className="size-5" aria-hidden="true" />}>
          문자 문의하기
        </Button>
      </div>
    </Card>
  );
}
