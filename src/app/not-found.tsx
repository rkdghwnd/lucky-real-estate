import type { Metadata } from 'next';
import { Button } from 'antd';

export const metadata: Metadata = {
  title: '페이지를 찾을 수 없습니다',
};

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center">
      <svg viewBox="0 0 220 150" role="img" aria-label="빈 페이지 일러스트" className="w-64 max-w-full">
        <rect x="24" y="70" width="38" height="66" rx="4" fill="#eef0f3" />
        <rect x="68" y="46" width="46" height="90" rx="4" fill="#dbe4ff" />
        <rect x="120" y="82" width="34" height="54" rx="4" fill="#eef0f3" />
        <rect x="78" y="58" width="10" height="10" rx="2" fill="#ffffff" />
        <rect x="94" y="58" width="10" height="10" rx="2" fill="#ffffff" />
        <rect x="78" y="76" width="10" height="10" rx="2" fill="#ffffff" />
        <rect x="94" y="76" width="10" height="10" rx="2" fill="#ffffff" />
        <circle cx="150" cy="58" r="28" fill="#ffffff" stroke="#1677ff" strokeWidth="8" />
        <line x1="170" y1="78" x2="196" y2="104" stroke="#1677ff" strokeWidth="9" strokeLinecap="round" />
      </svg>
      <p className="mt-6 text-6xl font-extrabold tracking-tight text-brand">404</p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">페이지를 찾을 수 없습니다.</h1>
      <p className="mt-2 text-muted">요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-2.5">
        <Button type="primary" size="large" href="/">홈으로 돌아가기</Button>
        <Button size="large" href="/listings">매물 보기</Button>
      </div>
    </div>
  );
}
