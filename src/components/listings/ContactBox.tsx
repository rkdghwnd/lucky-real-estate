import { Phone } from 'lucide-react';
import { Card } from 'antd';
import { siteConfig } from '@/lib/site';
import { PhoneConsultButton } from '@/components/layout/PhoneConsultButton';

export function ContactBox() {
  return (
    <Card styles={{ body: { padding: 20 } }}>
      <p className="text-sm font-bold text-ink">문의하기</p>
      <p className="mt-1 text-sm text-muted">{siteConfig.name}</p>
      <p className="mt-3 flex items-center gap-2 text-2xl font-extrabold text-brand">
        <Phone className="size-5" aria-hidden="true" />
        {siteConfig.phone}
      </p>
      <div className="mt-4">
        <PhoneConsultButton type="primary" size="large" block icon={<Phone className="size-5" aria-hidden="true" />}>
          전화 상담하기
        </PhoneConsultButton>
      </div>
    </Card>
  );
}
