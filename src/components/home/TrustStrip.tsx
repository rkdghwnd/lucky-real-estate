import { Factory, ShieldCheck, Headphones, MapPin } from 'lucide-react';
import { Card } from 'antd';

const ITEMS = [
  { icon: Factory, label: '공장·창고·토지 전문' },
  { icon: ShieldCheck, label: '정직한 중개·투명한 거래' },
  { icon: Headphones, label: '신속한 매물 상담' },
  { icon: MapPin, label: '인천 서구 전문 부동산' },
] as const;

export function TrustStrip() {
  return (
    <section aria-label="행운부동산 강점" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ITEMS.map(({ icon: Icon, label }) => (
        <Card key={label} size="small" styles={{ body: { display: 'flex', alignItems: 'center', gap: 12 } }}>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-light text-brand">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <p className="text-sm font-bold text-ink">{label}</p>
        </Card>
      ))}
    </section>
  );
}
