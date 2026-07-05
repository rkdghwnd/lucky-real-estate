import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '매물 관리자',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] bg-[#f5f7fa] text-ink">{children}</div>;
}
