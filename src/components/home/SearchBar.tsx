'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, Input, Button } from 'antd';
import { Search } from 'lucide-react';

const DEAL = ['전체', '매매', '임대'];
const TYPE = ['전체', '공장', '창고', '토지', '기타'];

export function SearchBar({ regions }: { regions: string[] }) {
  const router = useRouter();
  const [deal, setDeal] = useState('전체');
  const [type, setType] = useState('전체');
  const [region, setRegion] = useState('전체');
  const [keyword, setKeyword] = useState('');

  const submit = () => {
    const p = new URLSearchParams();
    if (deal !== '전체') p.set('deal', deal);
    if (type !== '전체') p.set('type', type);
    if (region !== '전체') p.set('region', region);
    if (keyword.trim()) p.set('keyword', keyword.trim());
    const qs = p.toString();
    router.push(qs ? `/listings?${qs}` : '/listings');
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-hairline bg-canvas p-3 shadow-[0_12px_32px_rgba(10,11,13,0.12)] sm:flex-row sm:flex-wrap lg:flex-nowrap lg:items-center">
      <Select
        aria-label="거래유형"
        size="large"
        value={deal}
        onChange={setDeal}
        className="sm:flex-1"
        style={{ width: '100%' }}
        options={DEAL.map(v => ({ value: v, label: v === '전체' ? '거래유형 전체' : v }))}
      />
      <Select
        aria-label="매물종류"
        size="large"
        value={type}
        onChange={setType}
        className="sm:flex-1"
        style={{ width: '100%' }}
        options={TYPE.map(v => ({ value: v, label: v === '전체' ? '매물종류 전체' : v }))}
      />
      <Select
        aria-label="지역"
        size="large"
        value={region}
        onChange={setRegion}
        className="sm:flex-1"
        style={{ width: '100%' }}
        options={[{ value: '전체', label: '지역 전체' }, ...regions.map(r => ({ value: r, label: r }))]}
      />
      <Input
        aria-label="키워드 검색"
        size="large"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        onPressEnter={submit}
        placeholder="키워드 검색 (예: 원당동 공장)"
        className="w-full sm:flex-[2] sm:basis-48"
      />
      <Button type="primary" size="large" onClick={submit} icon={<Search className="size-5" aria-hidden="true" />}>
        검색
      </Button>
    </div>
  );
}
