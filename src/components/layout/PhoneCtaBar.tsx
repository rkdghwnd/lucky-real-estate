import { siteConfig } from '@/lib/site';

export function PhoneCtaBar() {
  return (
    <>
      <a href={siteConfig.phoneHref} className="fixed inset-x-0 bottom-0 z-50 bg-accent py-4 text-center text-xl font-bold text-white sm:hidden">📞 지금 전화상담</a>
      <a href={siteConfig.phoneHref} className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 rounded-full bg-accent px-6 py-4 text-lg font-bold text-white shadow-lg sm:flex">📞 전화상담 {siteConfig.phone}</a>
    </>
  );
}
