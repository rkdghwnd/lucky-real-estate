import { siteConfig } from '@/lib/site';

export function PhoneCtaBar() {
  return (
    <>
      <a
        href={siteConfig.phoneHref}
        className="fixed inset-x-0 bottom-0 z-50 bg-brand py-4 text-center text-xl font-bold text-white sm:hidden"
      >
        📞 지금 전화상담
      </a>
      <a
        href={siteConfig.phoneHref}
        className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 rounded-full bg-brand px-6 py-4 text-lg font-bold text-white transition hover:bg-brand-dark hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] sm:flex"
      >
        📞 전화상담 {siteConfig.phone}
      </a>
    </>
  );
}
