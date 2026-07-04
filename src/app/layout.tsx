import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PhoneCtaBar } from '@/components/layout/PhoneCtaBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrgJsonLd, buildVerificationMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: `${siteConfig.name} | 인천 서구 공장·창고·토지`, template: `%s | ${siteConfig.shortName}` },
  description: siteConfig.positioning,
  openGraph: { siteName: siteConfig.name, locale: 'ko_KR', type: 'website' },
  verification: buildVerificationMetadata(),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen pb-20 sm:pb-0">
        <JsonLd data={buildOrgJsonLd()} />
        <Header />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <Footer />
        <PhoneCtaBar />
      </body>
    </html>
  );
}
