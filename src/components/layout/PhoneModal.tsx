'use client';
import { useState } from 'react';
import { siteConfig } from '@/lib/site';

export function PhoneModalTrigger({ label = '📞 전화상담', className = '' }: { label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>{label}</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="전화상담"
             className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
             onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-lg font-bold text-ink">{siteConfig.name}</p>
            <p className="mt-1 text-muted">{siteConfig.businessHours}</p>
            <a href={siteConfig.phoneHref} className="mt-4 block rounded-xl bg-gold py-4 text-2xl font-black text-navy-dark transition hover:bg-gold-dark">📞 {siteConfig.phone}</a>
            <button type="button" onClick={() => setOpen(false)} className="mt-3 text-muted underline">닫기</button>
          </div>
        </div>
      )}
    </>
  );
}
