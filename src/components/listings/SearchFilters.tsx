'use client';
import { useState } from 'react';
import { Card, Input, Radio, Select, InputNumber, Button } from 'antd';
import { SlidersHorizontal } from 'lucide-react';

export interface FilterDraft {
  dealType: string;
  propertyType: string;
  region: string;
  priceMin: string;
  priceMax: string;
  areaMin: string;
  areaMax: string;
  keyword: string;
}

export const EMPTY_DRAFT: FilterDraft = {
  dealType: '전체',
  propertyType: '전체',
  region: '전체',
  priceMin: '',
  priceMax: '',
  areaMin: '',
  areaMax: '',
  keyword: '',
};

const DEALS = ['전체', '매매', '임대'];
const TYPES = ['전체', '공장', '창고', '토지', '기타'];

const numToStr = (v: number | null) => (v == null ? '' : String(v));
const strToNum = (s: string) => (s === '' ? null : Number(s));

export function SearchFilters({
  initial,
  regions,
  onApply,
  onReset,
  sticky = true,
}: {
  initial: FilterDraft;
  regions: string[];
  onApply: (draft: FilterDraft) => void;
  onReset: () => void;
  sticky?: boolean;
}) {
  const [d, setD] = useState<FilterDraft>(initial);
  const set = (patch: Partial<FilterDraft>) => setD(prev => ({ ...prev, ...patch }));

  return (
    <Card className={`h-fit overflow-hidden rounded-3xl border border-hairline/80 bg-canvas shadow-sm${sticky ? ' lg:sticky lg:top-24' : ''}`} styles={{ body: { padding: 24 } }}>
      <p className="mb-6 flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink">
        <SlidersHorizontal className="size-5 text-brand" aria-hidden="true" />
        상세 검색
      </p>
      <form
        onSubmit={e => {
          e.preventDefault();
          onApply(d);
        }}
        aria-label="매물 검색 필터"
        className="flex flex-col gap-6"
      >
        <div>
          <label htmlFor="f-keyword" className="mb-2 block text-xs font-bold text-muted uppercase tracking-wider">키워드</label>
          <Input id="f-keyword" aria-label="키워드" size="large" value={d.keyword} onChange={e => set({ keyword: e.target.value })} placeholder="예: 원당동 공장" className="rounded-xl border-hairline/80 focus:border-brand" />
        </div>

        <div>
          <p className="mb-2.5 text-xs font-bold text-muted uppercase tracking-wider">거래유형</p>
          <Radio.Group value={d.dealType} onChange={e => set({ dealType: e.target.value })} className="flex flex-col gap-2">
            {DEALS.map(o => <Radio key={o} value={o} className="text-[0.95rem] font-semibold text-ink">{o}</Radio>)}
          </Radio.Group>
        </div>

        <div>
          <p className="mb-2.5 text-xs font-bold text-muted uppercase tracking-wider">매물종류</p>
          <Radio.Group value={d.propertyType} onChange={e => set({ propertyType: e.target.value })} className="flex flex-col gap-2">
            {TYPES.map(o => <Radio key={o} value={o} className="text-[0.95rem] font-semibold text-ink">{o}</Radio>)}
          </Radio.Group>
        </div>

        <div>
          <label htmlFor="f-region" className="mb-2 block text-xs font-bold text-muted uppercase tracking-wider">지역</label>
          <Select
            id="f-region"
            aria-label="지역"
            size="large"
            style={{ width: '100%' }}
            value={d.region}
            onChange={v => set({ region: v })}
            options={[{ value: '전체', label: '전체' }, ...regions.map(r => ({ value: r, label: r }))]}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-muted uppercase tracking-wider">가격 (만원)</p>
          <div className="flex items-center gap-2">
            <InputNumber aria-label="가격 최소" size="large" min={0} controls={false} style={{ width: '100%' }} placeholder="최소" value={strToNum(d.priceMin)} onChange={v => set({ priceMin: numToStr(v) })} />
            <span className="text-muted font-bold">~</span>
            <InputNumber aria-label="가격 최대" size="large" min={0} controls={false} style={{ width: '100%' }} placeholder="최대" value={strToNum(d.priceMax)} onChange={v => set({ priceMax: numToStr(v) })} />
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold text-muted uppercase tracking-wider">면적 (㎡)</p>
          <div className="flex items-center gap-2">
            <InputNumber aria-label="면적 최소" size="large" min={0} controls={false} style={{ width: '100%' }} placeholder="최소" value={strToNum(d.areaMin)} onChange={v => set({ areaMin: numToStr(v) })} />
            <span className="text-muted font-bold">~</span>
            <InputNumber aria-label="면적 최대" size="large" min={0} controls={false} style={{ width: '100%' }} placeholder="최대" value={strToNum(d.areaMax)} onChange={v => set({ areaMax: numToStr(v) })} />
          </div>
        </div>

        <div className="flex gap-2 pt-3">
          <Button type="primary" htmlType="submit" size="large" className="flex-1 font-bold rounded-xl shadow-none">검색</Button>
          <Button
            htmlType="button"
            size="large"
            className="font-bold rounded-xl bg-surface border-0 text-ink hover:bg-hairline"
            onClick={() => {
              setD(EMPTY_DRAFT);
              onReset();
            }}
          >
            초기화
          </Button>
        </div>
      </form>
    </Card>
  );
}
