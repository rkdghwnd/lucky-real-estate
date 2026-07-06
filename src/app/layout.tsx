import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Noto_Sans_KR } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AntdProvider } from '@/components/providers/AntdProvider';
import { SiteChrome } from '@/components/layout/SiteChrome';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrgJsonLd, buildWebsiteJsonLd, buildVerificationMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

// Self-hosted Korean web font (fetched at build), applied site-wide as the default face.
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

const defaultTitle = `${siteConfig.name} | 인천 서구 공장·창고·토지`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: defaultTitle, template: `%s | ${siteConfig.shortName}` },
  description: siteConfig.positioning,
  applicationName: siteConfig.name,
  icons: {
    icon: [{ url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' }],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  openGraph: { siteName: siteConfig.name, locale: 'ko_KR', type: 'website', images: ['/banner0.png'] },
  twitter: { card: 'summary_large_image', title: defaultTitle, description: siteConfig.positioning, images: ['/banner0.png'] },
  verification: buildVerificationMetadata(),
};

export const viewport: Viewport = {
  themeColor: '#1677ff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <meta name="naver-site-verification" content="1b7d635990b8e4031244fd905dd57c9e48452de8" />
      <body className="min-h-screen">
        <JsonLd data={buildOrgJsonLd()} />
        <JsonLd data={buildWebsiteJsonLd()} />
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
