import type { Metadata } from 'next';
import './globals.css';
import { Noto_Sans_KR } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AntdProvider } from '@/components/providers/AntdProvider';
import { SiteChrome } from '@/components/layout/SiteChrome';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrgJsonLd, buildVerificationMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

// Self-hosted Korean web font (fetched at build), applied site-wide as the default face.
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: `${siteConfig.name} | 인천 서구 공장·창고·토지`, template: `%s | ${siteConfig.shortName}` },
  description: siteConfig.positioning,
  openGraph: { siteName: siteConfig.name, locale: 'ko_KR', type: 'website' },
  verification: buildVerificationMetadata(),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body className="min-h-screen">
        <JsonLd data={buildOrgJsonLd()} />
        <AntdRegistry layer>
          <AntdProvider>
            <SiteChrome header={<Header />} footer={<Footer />}>
              {children}
            </SiteChrome>
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
