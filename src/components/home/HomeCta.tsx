import { Phone } from 'lucide-react';
import { Card } from 'antd';
import { siteConfig } from '@/lib/site';
import { PhoneConsultButton } from '@/components/layout/PhoneConsultButton';

export function HomeCta() {
  return (
    <Card className="border-0 bg-brand-light rounded-2xl shadow-sm" styles={{ body: { padding: '24px 32px' } }}>
      <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-xl font-extrabold text-brand-dark">원하시는 조건의 매물을 찾지 못하셨나요?</p>
          <p className="mt-1.5 text-sm font-semibold text-muted">전화주시면 최적의 맞춤형 매물을 바로 매칭해 드립니다.</p>
        </div>
        <PhoneConsultButton
          type="primary"
          size="large"
          className="shrink-0 rounded-xl font-bold shadow-none hover:scale-[1.02] transition-transform duration-200"
          icon={<Phone className="size-5" aria-hidden="true" />}
        >
          {siteConfig.phone}
        </PhoneConsultButton>
      </div>
    </Card>
  );
}
