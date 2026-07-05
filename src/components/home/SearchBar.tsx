'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEAL = ['전체', '매매', '임대'];
const TYPE = ['전체', '공장', '창고', '토지', '기타'];
const selectCls =
  'h-12 rounded-md border border-hairline bg-canvas px-3 text-ink outline-none transition focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30';

export function SearchBar({ regions }: { regions: string[] }) {
  const router = useRouter();
  const [deal, setDeal] = useState('전체');
  const [type, setType] = useState('전체');
  const [region, setRegion] = useState('전체');
  const [keyword, setKeyword] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (deal !== '전체') p.set('deal', deal);
    if (type !== '전체') p.set('type', type);
    if (region !== '전체') p.set('region', region);
    if (keyword.trim()) p.set('keyword', keyword.trim());
    const qs = p.toString();
    router.push(qs ? `/listings?${qs}` : '/listings');
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-2 rounded-xl border border-hairline bg-canvas p-3 shadow-[0_12px_32px_rgba(10,11,13,0.12)] sm:flex-row sm:flex-wrap lg:flex-nowrap lg:items-center"
    >
      <select aria-label="거래유형" value={deal} onChange={e => setDeal(e.target.value)} className={`${selectCls} sm:flex-1`}>
        {DEAL.map(v => <option key={v} value={v}>{v === '전체' ? '거래유형 전체' : v}</option>)}
      </select>
      <select aria-label="매물종류" value={type} onChange={e => setType(e.target.value)} className={`${selectCls} sm:flex-1`}>
        {TYPE.map(v => <option key={v} value={v}>{v === '전체' ? '매물종류 전체' : v}</option>)}
      </select>
      <select aria-label="지역" value={region} onChange={e => setRegion(e.target.value)} className={`${selectCls} sm:flex-1`}>
        <option value="전체">지역 전체</option>
        {regions.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <input
        aria-label="키워드 검색"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        placeholder="키워드 검색 (예: 원당동 공장)"
        className={`${selectCls} w-full sm:flex-[2] sm:basis-48`}
      />
      <Button type="submit" size="lg" className="h-12 sm:w-auto">
        <Search className="size-5" aria-hidden="true" />
        검색
      </Button>
    </form>
  );
}
