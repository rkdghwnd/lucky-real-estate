'use client';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { siteConfig } from '@/lib/site';

export function PhoneModalTrigger({ label = '📞 전화상담', className = '' }: { label?: string; className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={className}>{label}</button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{siteConfig.name}</DialogTitle>
        <DialogDescription>{siteConfig.businessHours}</DialogDescription>
        <a
          href={siteConfig.phoneHref}
          className="mt-4 block rounded-full bg-brand py-4 text-2xl font-bold text-white transition hover:bg-brand-dark"
        >
          📞 {siteConfig.phone}
        </a>
        <DialogClose asChild>
          <button type="button" className="mt-3 text-muted underline">닫기</button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
