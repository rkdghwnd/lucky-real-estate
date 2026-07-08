import { Phone } from 'lucide-react';
import { Card } from 'antd';
import { siteConfig } from '@/lib/site';
import { PhoneConsultButton } from '@/components/layout/PhoneConsultButton';

export function ContactBox() {
  return (
    <Card styles={{ body: { padding: 24 } }} className="border border-hairline/80 bg-canvas rounded-2xl shadow-sm">
      <p className="text-xs font-bold text-muted uppercase tracking-wider">문의처</p>
      <p className="mt-1 text-base font-bold text-ink">{siteConfig.name}</p>
      <p className="mt-4 flex items-center gap-2 text-2xl font-extrabold text-brand">
        <Phone className="size-5" aria-hidden="true" />
        {siteConfig.phone}
      </p>
      <div className="mt-5">
        <PhoneConsultButton type="primary" size="large" block className="rounded-xl font-bold shadow-none" icon={<Phone className="size-5" aria-hidden="true" />}>
          전화 상담하기
        </PhoneConsultButton>
      </div>
    </Card>
  );
}
