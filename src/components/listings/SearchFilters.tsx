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
}: {
  initial: FilterDraft;
  regions: string[];
  onApply: (draft: FilterDraft) => void;
  onReset: () => void;
}) {
  const [d, setD] = useState<FilterDraft>(initial);
  const set = (patch: Partial<FilterDraft>) => setD(prev => ({ ...prev, ...patch }));

  return (
    <Card className="h-fit lg:sticky lg:top-24" styles={{ body: { padding: 20 } }}>
      <p className="mb-5 flex items-center gap-2 text-base font-bold text-ink">
        <SlidersHorizontal className="size-[1.05rem] text-brand" aria-hidden="true" />
        필터
      </p>
      <form
        onSubmit={e => {
          e.preventDefault();
          onApply(d);
        }}
        aria-label="매물 검색 필터"
        className="flex flex-col gap-5"
      >
        <div>
          <label htmlFor="f-keyword" className="mb-2 block text-sm font-bold text-ink">키워드</label>
          <Input id="f-keyword" aria-label="키워드" size="large" value={d.keyword} onChange={e => set({ keyword: e.target.value })} placeholder="예: 원당동 공장" />
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-ink">거래유형</p>
          <Radio.Group value={d.dealType} onChange={e => set({ dealType: e.target.value })} className="flex flex-col gap-1.5">
            {DEALS.map(o => <Radio key={o} value={o}>{o}</Radio>)}
          </Radio.Group>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-ink">매물종류</p>
          <Radio.Group value={d.propertyType} onChange={e => set({ propertyType: e.target.value })} className="flex flex-col gap-1.5">
            {TYPES.map(o => <Radio key={o} value={o}>{o}</Radio>)}
          </Radio.Group>
        </div>

        <div>
          <label htmlFor="f-region" className="mb-2 block text-sm font-bold text-ink">지역</label>
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
          <p className="mb-2 text-sm font-bold text-ink">가격 (만원)</p>
          <div className="flex items-center gap-2">
            <InputNumber aria-label="가격 최소" size="large" min={0} controls={false} style={{ width: '100%' }} placeholder="최소" value={strToNum(d.priceMin)} onChange={v => set({ priceMin: numToStr(v) })} />
            <span className="text-muted">~</span>
            <InputNumber aria-label="가격 최대" size="large" min={0} controls={false} style={{ width: '100%' }} placeholder="최대" value={strToNum(d.priceMax)} onChange={v => set({ priceMax: numToStr(v) })} />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-ink">면적 (㎡)</p>
          <div className="flex items-center gap-2">
            <InputNumber aria-label="면적 최소" size="large" min={0} controls={false} style={{ width: '100%' }} placeholder="최소" value={strToNum(d.areaMin)} onChange={v => set({ areaMin: numToStr(v) })} />
            <span className="text-muted">~</span>
            <InputNumber aria-label="면적 최대" size="large" min={0} controls={false} style={{ width: '100%' }} placeholder="최대" value={strToNum(d.areaMax)} onChange={v => set({ areaMax: numToStr(v) })} />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="primary" htmlType="submit" size="large" className="flex-1">검색</Button>
          <Button
            htmlType="button"
            size="large"
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
