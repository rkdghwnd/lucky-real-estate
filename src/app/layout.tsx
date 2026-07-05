import type { Metadata } from 'next';
import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AntdProvider } from '@/components/providers/AntdProvider';
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
      <body className="min-h-screen">
        <JsonLd data={buildOrgJsonLd()} />
        <AntdRegistry layer>
          <AntdProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
