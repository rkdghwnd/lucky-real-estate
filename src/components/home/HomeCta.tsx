import { Phone } from 'lucide-react';
import { Button } from 'antd';
import { siteConfig } from '@/lib/site';

export function HomeCta() {
  return (
    <section className="flex flex-col items-center gap-4 rounded-xl bg-surface-dark px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
      <div>
        <p className="text-lg font-bold text-white sm:text-xl">원하시는 조건의 매물을 찾지 못하셨나요?</p>
        <p className="mt-1 text-white/70">조건을 알려주시면 맞춤으로 찾아드립니다.</p>
      </div>
      <Button size="large" className="shrink-0" href={siteConfig.phoneHref} icon={<Phone className="size-5" aria-hidden="true" />}>
        {siteConfig.phone}
      </Button>
    </section>
  );
}
