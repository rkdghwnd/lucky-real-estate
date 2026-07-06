import { Phone } from 'lucide-react';
import { Card } from 'antd';
import { siteConfig } from '@/lib/site';
import { PhoneConsultButton } from '@/components/layout/PhoneConsultButton';

export function HomeCta() {
  return (
    <Card>
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-lg font-bold text-ink sm:text-xl">원하시는 조건의 매물을 찾지 못하셨나요?</p>
          <p className="mt-1 text-muted">조건을 알려주시면 맞춤으로 찾아드립니다.</p>
        </div>
        <PhoneConsultButton
          type="primary"
          size="large"
          className="shrink-0"
          icon={<Phone className="size-5" aria-hidden="true" />}
        >
          {siteConfig.phone}
        </PhoneConsultButton>
      </div>
    </Card>
  );
}
