import { siteConfig } from '@/lib/site';

export function PhoneCtaBar() {
  return (
    <>
      <a
        href={siteConfig.phoneHref}
        className="fixed inset-x-0 bottom-0 z-50 bg-gold py-4 text-center text-xl font-black text-navy-dark shadow-[0_-2px_10px_rgba(0,0,0,0.15)] sm:hidden"
      >
        📞 지금 전화상담
      </a>
      <a
        href={siteConfig.phoneHref}
        className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 rounded-full bg-gold px-6 py-4 text-lg font-black text-navy-dark shadow-lg transition hover:bg-gold-dark sm:flex"
      >
        📞 전화상담 {siteConfig.phone}
      </a>
    </>
  );
}
