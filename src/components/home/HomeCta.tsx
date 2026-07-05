import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/lib/site';

export function HomeCta() {
  return (
    <section className="flex flex-col items-center gap-4 rounded-xl bg-surface-dark px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
      <div>
        <p className="text-lg font-bold text-white sm:text-xl">원하시는 조건의 매물을 찾지 못하셨나요?</p>
        <p className="mt-1 text-white/70">조건을 알려주시면 비공개 매물까지 맞춤으로 찾아드립니다.</p>
      </div>
      <Button asChild variant="onDark" size="lg" className="shrink-0">
        <a href={siteConfig.phoneHref}>
          <Phone className="size-5" aria-hidden="true" />
          {siteConfig.phone}
        </a>
      </Button>
    </section>
  );
}
