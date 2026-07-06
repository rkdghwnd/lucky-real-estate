# gongjangtown 스타일 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 행운부동산공인중개사사무소 사이트를 gongjangtown.com식 정보밀집형 공장·창고 포털 구성으로 재구축한다(제자리 재스킨).

**Architecture:** 기존 Next.js 16 App Router / Supabase / shadcn 프리미티브를 재사용한다. 순수 필터 로직을 확장하고, 홈을 검색 페이지로 통합하며, 확장 필터 사이드바 + ㎡↔평 변환기 + 조밀 카드로 UI를 교체한다. 디자인 토큰(색)은 유지하되 라운드·간격만 조밀하게 조정한다.

**Tech Stack:** Next.js 16, TypeScript, Tailwind v4(@theme), Supabase, shadcn/ui(Radix+cva), Vitest + Testing Library.

## Global Constraints

- 스택 유지: Next.js 16 / Supabase / Netlify. 목록 계열 페이지는 `export const dynamic = 'force-static'`.
- 접근성: 루트 18px, 탭 타깃 ≥ 44px(`h-11`), 고대비. 본문/탭 타깃을 접근성 크기 아래로 줄이지 않는다.
- 가격 표기는 읽기 쉬운 형식(`매매 6억 6,000만원`) 유지. 압축 만원 표기(`66,000`)는 비채택.
- 색 토큰 유지: 브랜드 블루 `#0052ff` 액센트 + 중립 그레이 크롬. 팔레트 자체는 바꾸지 않는다.
- 브랜드/매물/회사정보는 행운 것 사용. 경쟁사 시각자산·문구 복제 금지.
- UI 카피에 em-dash(—) 사용 금지.
- TDD, 잦은 커밋. 태스크 종료마다 게이트: `npx vitest run` / `npx tsc --noEmit` / `npx eslint .` / `npm run build`.
- 브랜치: 구현 시작 전 `main`에서 피처 브랜치 생성(실행 핸드오프에서 처리).

---

### Task 1: 필터 버킷 로직 확장

**Files:**
- Modify: `src/lib/listings.ts` (add bucket tables, `matchArea`, `matchPrice`, extend `ListingFilter` + `applyFilters`)
- Test: `src/lib/listings.test.ts` (create; if it exists, append cases)

**Interfaces:**
- Consumes: `pyeong(m2)` from `src/lib/format.ts`; `Listing`, `PropertyType`, `DealType` from `src/lib/types.ts`.
- Produces:
  - `type AreaBucket`, `type PriceBucket`
  - `AREA_BUCKETS`, `SALE_PRICE_BUCKETS`, `RENT_PRICE_BUCKETS` (arrays of `{ value, label, ... }`)
  - `matchArea(bucket: AreaBucket, pyeongVal: number): boolean`
  - `matchPrice(bucket: PriceBucket, l: Listing): boolean`
  - extended `ListingFilter { propertyType?, dealType?, areaBucket?, priceBucket? }`
  - `applyFilters(listings, filter)` honoring all four fields.

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/listings.test.ts
import { describe, it, expect } from 'vitest';
import { applyFilters, matchArea, matchPrice, AREA_BUCKETS, SALE_PRICE_BUCKETS } from './listings';
import { rowToListing } from './listings';
import { sampleRows } from '@/test/fixtures/listings';

const all = sampleRows.map(rowToListing);

describe('matchArea', () => {
  it('60평 이하 includes 60, excludes 61', () => {
    expect(matchArea('~60', 60)).toBe(true);
    expect(matchArea('~60', 61)).toBe(false);
  });
  it('100-200 excludes the lower boundary, includes the upper', () => {
    expect(matchArea('100-200', 100)).toBe(false);
    expect(matchArea('100-200', 200)).toBe(true);
  });
  it('전체 always matches', () => {
    expect(matchArea('전체', 5)).toBe(true);
  });
});

describe('matchPrice', () => {
  const sale = rowToListing({ ...sampleRows[0], deal_type: '매매', price: 150_000_000, monthly_rent: null });
  const rent = rowToListing({ ...sampleRows[0], deal_type: '임대', price: 30_000_000, monthly_rent: 2_000_000 });
  it('매매 bucket matches on price and requires 매매 dealType', () => {
    expect(matchPrice('매매:1-2억', sale)).toBe(true);
    expect(matchPrice('매매:1-2억', rent)).toBe(false);
  });
  it('임대 bucket matches on monthlyRent and requires 임대 dealType', () => {
    expect(matchPrice('임대:100-300만', rent)).toBe(true);
    expect(matchPrice('임대:100-300만', sale)).toBe(false);
  });
});

describe('applyFilters (extended)', () => {
  it('still filters by propertyType and dealType', () => {
    const out = applyFilters(all, { propertyType: '공장', dealType: '전체' });
    expect(out.every(l => l.propertyType === '공장')).toBe(true);
  });
  it('excludes listings with null land area when an area bucket is set', () => {
    const withNull = [rowToListing({ ...sampleRows[0], land_area_m2: null })];
    expect(applyFilters(withNull, { areaBucket: '100-200' })).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npx vitest run src/lib/listings.test.ts`
Expected: FAIL (`matchArea`/`matchPrice` not exported).

- [ ] **Step 3: Implement in `src/lib/listings.ts`**

Add the import at the top (next to existing imports):

```ts
import { pyeong } from './format';
```

Append after the existing `ListingFilter`/`applyFilters` block, then REPLACE `ListingFilter` and `applyFilters` with the extended versions below:

```ts
export type AreaBucket = '전체' | '~60' | '60-100' | '100-200' | '200-300' | '300~';
export type PriceBucket =
  | '전체'
  | '매매:~5천' | '매매:5천-1억' | '매매:1-2억' | '매매:2-5억' | '매매:5-10억' | '매매:10-20억' | '매매:20억~'
  | '임대:~100만' | '임대:100-300만' | '임대:300-500만' | '임대:500-1000만' | '임대:1000만~';

interface AreaBucketDef { value: AreaBucket; label: string; min: number; max: number | null } // 평
export const AREA_BUCKETS: AreaBucketDef[] = [
  { value: '전체', label: '평수 전체', min: 0, max: null },
  { value: '~60', label: '60평 이하', min: 0, max: 60 },
  { value: '60-100', label: '60~100평', min: 60, max: 100 },
  { value: '100-200', label: '100~200평', min: 100, max: 200 },
  { value: '200-300', label: '200~300평', min: 200, max: 300 },
  { value: '300~', label: '300평 이상', min: 300, max: null },
];

interface PriceBucketDef { value: PriceBucket; label: string; deal: DealType; min: number; max: number | null } // 원
export const SALE_PRICE_BUCKETS: PriceBucketDef[] = [
  { value: '매매:~5천', label: '5천만원 이하', deal: '매매', min: 0, max: 50_000_000 },
  { value: '매매:5천-1억', label: '5천만~1억', deal: '매매', min: 50_000_000, max: 100_000_000 },
  { value: '매매:1-2억', label: '1억~2억', deal: '매매', min: 100_000_000, max: 200_000_000 },
  { value: '매매:2-5억', label: '2억~5억', deal: '매매', min: 200_000_000, max: 500_000_000 },
  { value: '매매:5-10억', label: '5억~10억', deal: '매매', min: 500_000_000, max: 1_000_000_000 },
  { value: '매매:10-20억', label: '10억~20억', deal: '매매', min: 1_000_000_000, max: 2_000_000_000 },
  { value: '매매:20억~', label: '20억 이상', deal: '매매', min: 2_000_000_000, max: null },
];
export const RENT_PRICE_BUCKETS: PriceBucketDef[] = [
  { value: '임대:~100만', label: '월 100만원 이하', deal: '임대', min: 0, max: 1_000_000 },
  { value: '임대:100-300만', label: '월 100~300만', deal: '임대', min: 1_000_000, max: 3_000_000 },
  { value: '임대:300-500만', label: '월 300~500만', deal: '임대', min: 3_000_000, max: 5_000_000 },
  { value: '임대:500-1000만', label: '월 500~1000만', deal: '임대', min: 5_000_000, max: 10_000_000 },
  { value: '임대:1000만~', label: '월 1000만 이상', deal: '임대', min: 10_000_000, max: null },
];

export function matchArea(bucket: AreaBucket, pyeongVal: number): boolean {
  const def = AREA_BUCKETS.find(b => b.value === bucket);
  if (!def || def.value === '전체') return true;
  return pyeongVal > def.min && (def.max == null || pyeongVal <= def.max);
}

export function matchPrice(bucket: PriceBucket, l: Listing): boolean {
  if (bucket === '전체') return true;
  const def = [...SALE_PRICE_BUCKETS, ...RENT_PRICE_BUCKETS].find(b => b.value === bucket);
  if (!def || l.dealType !== def.deal) return false;
  const value = def.deal === '매매' ? l.price : l.monthlyRent;
  if (value == null) return false;
  return value > def.min && (def.max == null || value <= def.max);
}

export interface ListingFilter {
  propertyType?: PropertyType | '전체';
  dealType?: DealType | '전체';
  areaBucket?: AreaBucket;
  priceBucket?: PriceBucket;
}

export function applyFilters(listings: Listing[], f: ListingFilter): Listing[] {
  return listings.filter(l => {
    if (f.propertyType && f.propertyType !== '전체' && l.propertyType !== f.propertyType) return false;
    if (f.dealType && f.dealType !== '전체' && l.dealType !== f.dealType) return false;
    if (f.areaBucket && f.areaBucket !== '전체') {
      if (l.landAreaM2 == null || !matchArea(f.areaBucket, pyeong(l.landAreaM2))) return false;
    }
    if (f.priceBucket && f.priceBucket !== '전체') {
      if (!matchPrice(f.priceBucket, l)) return false;
    }
    return true;
  });
}
```

Delete the OLD `ListingFilter`/`applyFilters` definitions so there is exactly one of each.

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/lib/listings.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/listings.ts src/lib/listings.test.ts
git commit -m "feat: extend applyFilters with area and price buckets"
```

---

### Task 2: ㎡↔평 변환 헬퍼 + UnitConverter 컴포넌트

**Files:**
- Modify: `src/lib/format.ts` (add `m2ToPyeong`, `pyeongToM2`)
- Create: `src/components/listings/UnitConverter.tsx`
- Test: `src/lib/format.test.ts` (append; create if absent), `src/components/listings/UnitConverter.test.tsx`

**Interfaces:**
- Produces: `m2ToPyeong(m2: number): number`, `pyeongToM2(p: number): number`, `<UnitConverter />` (no props).

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/format.test.ts  (append these; create file with imports if it does not exist)
import { describe, it, expect } from 'vitest';
import { m2ToPyeong, pyeongToM2 } from './format';

describe('area conversion', () => {
  it('converts m2 to pyeong', () => {
    expect(m2ToPyeong(3.305785)).toBeCloseTo(1, 3);
  });
  it('converts pyeong to m2', () => {
    expect(pyeongToM2(1)).toBeCloseTo(3.305785, 3);
  });
});
```

```tsx
// src/components/listings/UnitConverter.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnitConverter } from './UnitConverter';

describe('UnitConverter', () => {
  it('fills 평 when ㎡ is typed', async () => {
    const user = userEvent.setup();
    render(<UnitConverter />);
    await user.type(screen.getByLabelText('제곱미터'), '33.06');
    expect((screen.getByLabelText('평') as HTMLInputElement).value).toBe('10');
  });
  it('fills ㎡ when 평 is typed', async () => {
    const user = userEvent.setup();
    render(<UnitConverter />);
    await user.type(screen.getByLabelText('평'), '1');
    expect((screen.getByLabelText('제곱미터') as HTMLInputElement).value).toBe('3.31');
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npx vitest run src/lib/format.test.ts src/components/listings/UnitConverter.test.tsx`
Expected: FAIL (helpers/component missing).

- [ ] **Step 3: Implement**

In `src/lib/format.ts`, add after the `pyeong` function:

```ts
export function m2ToPyeong(m2: number): number {
  return m2 / PYEONG_PER_M2;
}

export function pyeongToM2(p: number): number {
  return p * PYEONG_PER_M2;
}
```

Create `src/components/listings/UnitConverter.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { m2ToPyeong, pyeongToM2 } from '@/lib/format';

const round2 = (n: number) => (Math.round(n * 100) / 100).toString();

export function UnitConverter() {
  const [m2, setM2] = useState('');
  const [py, setPy] = useState('');

  const onM2 = (v: string) => {
    setM2(v);
    const n = parseFloat(v);
    setPy(v !== '' && Number.isFinite(n) ? round2(m2ToPyeong(n)) : '');
  };
  const onPy = (v: string) => {
    setPy(v);
    const n = parseFloat(v);
    setM2(v !== '' && Number.isFinite(n) ? round2(pyeongToM2(n)) : '');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-hairline bg-brand-light px-4 py-2.5 text-sm">
      <span className="font-semibold text-ink">면적 변환기</span>
      <label className="flex items-center gap-1">
        <input inputMode="decimal" aria-label="제곱미터" value={m2} onChange={e => onM2(e.target.value)}
               className="h-11 w-24 rounded-md border border-hairline bg-canvas px-2 text-right text-ink" />
        <span className="text-muted">㎡</span>
      </label>
      <span aria-hidden="true" className="px-1 text-muted">=</span>
      <label className="flex items-center gap-1">
        <input inputMode="decimal" aria-label="평" value={py} onChange={e => onPy(e.target.value)}
               className="h-11 w-24 rounded-md border border-hairline bg-canvas px-2 text-right text-ink" />
        <span className="text-muted">평</span>
      </label>
    </div>
  );
}
```

- [ ] **Step 4: Run to verify pass**

Run: `npx vitest run src/lib/format.test.ts src/components/listings/UnitConverter.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/format.ts src/lib/format.test.ts src/components/listings/UnitConverter.tsx src/components/listings/UnitConverter.test.tsx
git commit -m "feat: add m2/pyeong converter helpers and UnitConverter"
```

---

### Task 3: 디자인 토큰 조밀화 + 프리미티브 재스킨

**Files:**
- Modify: `src/app/globals.css` (add compact radius scale note; no color change)
- Modify: `src/components/ui/card.tsx` (radius `rounded-3xl` → `rounded-md`, tighter default padding)
- Modify: `src/components/ui/button.tsx` (radius `rounded-full` → `rounded-md`)
- Modify: `src/components/ui/badge.tsx` (radius `rounded-full` → `rounded`)

**Interfaces:**
- Produces: same component APIs (variants/sizes unchanged). Only class strings change.

Rationale: gongjangtown is boxy/tabular. Reducing radius across primitives shifts the whole UI to the dense look while keeping every call site working.

- [ ] **Step 1: Card radius/padding**

In `src/components/ui/card.tsx`, change the `Card` base class:

```tsx
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card" className={cn('rounded-md border border-hairline bg-canvas', className)} {...props} />;
}
```

- [ ] **Step 2: Button radius**

In `src/components/ui/button.tsx`, change `rounded-full` to `rounded-md` in the `cva` base string (first argument), leaving all variants/sizes intact.

- [ ] **Step 3: Badge radius**

In `src/components/ui/badge.tsx`, change `rounded-full` to `rounded` in the `cva` base string.

- [ ] **Step 4: Run existing tests + typecheck**

Run: `npx vitest run && npx tsc --noEmit`
Expected: PASS (no test asserts radius; APIs unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/card.tsx src/components/ui/button.tsx src/components/ui/badge.tsx src/app/globals.css
git commit -m "feat: reskin ui primitives to dense (boxy) radius"
```

---

### Task 4: ListingCard 조밀 재디자인

**Files:**
- Modify: `src/components/listings/ListingCard.tsx`
- Test: `src/components/listings/ListingCard.test.tsx` (must stay green)

**Interfaces:**
- Consumes: `Badge` from `@/components/ui/badge`; `formatArea`, `formatDealPrice` from `@/lib/format`.
- Produces: `<ListingCard listing={Listing} />` (unchanged prop).

Existing test asserts these strings render: `공장 · 매매`, `인천광역시 서구 오류동`, `㎡`, `매매 18억`. Keep all of them.

- [ ] **Step 1: Confirm the test still describes desired behavior**

Run: `npx vitest run src/components/listings/ListingCard.test.tsx`
Expected: PASS against current card (baseline).

- [ ] **Step 2: Rewrite card denser**

Replace the body of `src/components/listings/ListingCard.tsx` with:

```tsx
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import type { Listing } from '@/lib/types';
import { formatArea, formatDealPrice } from '@/lib/format';

export function ListingCard({ listing: l }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${l.slug}`}
      className="group flex flex-col overflow-hidden rounded-md border border-hairline bg-canvas transition hover:border-brand"
      aria-label={`${l.title} 상세보기`}
    >
      <div className="relative aspect-[4/3] bg-brand-light">
        {l.images[0] ? (
          <Image src={l.images[0]} alt={l.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-muted">사진 준비중</div>
        )}
        <Badge className="absolute left-2 top-2">{l.propertyType} · {l.dealType}</Badge>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-1 text-base font-bold text-ink">{l.title}</h3>
        <p className="line-clamp-1 text-sm text-muted">📍 {l.address}</p>
        <div className="flex flex-wrap gap-x-3 text-sm text-ink">
          <span>대지 {formatArea(l.landAreaM2)}</span>
          {l.buildingAreaM2 != null && <span>건물 {formatArea(l.buildingAreaM2)}</span>}
        </div>
        <p className="mt-auto border-t border-hairline pt-2 text-base font-bold text-brand">{formatDealPrice(l)}</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Run test**

Run: `npx vitest run src/components/listings/ListingCard.test.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/listings/ListingCard.tsx
git commit -m "feat: denser ListingCard layout"
```

---

### Task 5: FilterSidebar (확장 필터)

**Files:**
- Create: `src/components/listings/FilterSidebar.tsx`
- Test: `src/components/listings/FilterSidebar.test.tsx`

**Interfaces:**
- Consumes: `AreaBucket`, `PriceBucket`, `AREA_BUCKETS`, `SALE_PRICE_BUCKETS`, `RENT_PRICE_BUCKETS` from `@/lib/listings`; `PropertyType`, `DealType` from `@/lib/types`.
- Produces:

```ts
export interface FilterState {
  propertyType: PropertyType | '전체';
  dealType: DealType | '전체';
  areaBucket: AreaBucket;
  priceBucket: PriceBucket;
}
export function FilterSidebar(props: {
  state: FilterState;
  resultCount: number;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
}): JSX.Element
```

Behavior: 종류/거래유형 are `aria-pressed` button groups. 평수 is a `<select>`. 가격 is a `<select>` whose options come from `SALE_PRICE_BUCKETS` when `dealType === '매매'`, `RENT_PRICE_BUCKETS` when `dealType === '임대'`, and the price select is hidden when `dealType === '전체'`.

- [ ] **Step 1: Write failing tests**

```tsx
// src/components/listings/FilterSidebar.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSidebar, type FilterState } from './FilterSidebar';

const base: FilterState = { propertyType: '전체', dealType: '전체', areaBucket: '전체', priceBucket: '전체' };

describe('FilterSidebar', () => {
  it('emits propertyType on 공장 click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSidebar state={base} resultCount={6} onChange={onChange} onReset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: '공장' }));
    expect(onChange).toHaveBeenCalledWith({ propertyType: '공장' });
  });

  it('hides the price select when dealType is 전체', () => {
    render(<FilterSidebar state={base} resultCount={6} onChange={vi.fn()} onReset={vi.fn()} />);
    expect(screen.queryByLabelText('가격 구간')).toBeNull();
  });

  it('shows 매매 price buckets when dealType is 매매', () => {
    render(<FilterSidebar state={{ ...base, dealType: '매매' }} resultCount={6} onChange={vi.fn()} onReset={vi.fn()} />);
    const select = screen.getByLabelText('가격 구간');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '1억~2억' })).toBeInTheDocument();
  });

  it('emits reset', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(<FilterSidebar state={base} resultCount={6} onChange={vi.fn()} onReset={onReset} />);
    await user.click(screen.getByRole('button', { name: '초기화' }));
    expect(onReset).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `npx vitest run src/components/listings/FilterSidebar.test.tsx`
Expected: FAIL (component missing).

- [ ] **Step 3: Implement `src/components/listings/FilterSidebar.tsx`**

```tsx
'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AREA_BUCKETS, SALE_PRICE_BUCKETS, RENT_PRICE_BUCKETS, type AreaBucket, type PriceBucket } from '@/lib/listings';
import type { PropertyType, DealType } from '@/lib/types';

const PROPERTY_TYPES: (PropertyType | '전체')[] = ['전체', '공장', '창고', '토지', '기타'];
const DEAL_TYPES: (DealType | '전체')[] = ['전체', '매매', '임대'];

export interface FilterState {
  propertyType: PropertyType | '전체';
  dealType: DealType | '전체';
  areaBucket: AreaBucket;
  priceBucket: PriceBucket;
}

function Chip({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-11 rounded-md border px-3 text-sm font-semibold transition ${
        active ? 'border-brand bg-brand text-white' : 'border-hairline bg-canvas text-ink hover:border-brand'
      }`}
    >
      {children}
    </button>
  );
}

export function FilterSidebar({
  state,
  resultCount,
  onChange,
  onReset,
}: {
  state: FilterState;
  resultCount: number;
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
}) {
  const priceBuckets = state.dealType === '매매' ? SALE_PRICE_BUCKETS : state.dealType === '임대' ? RENT_PRICE_BUCKETS : null;

  return (
    <Card aria-label="매물 필터">
      <CardHeader className="flex items-center justify-between">
        <p className="text-sm font-semibold text-muted">
          검색결과 <span className="font-bold text-ink">{resultCount}</span>건
        </p>
        <button type="button" onClick={onReset} className="text-sm font-semibold text-brand hover:text-brand-dark">
          초기화
        </button>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted">종류</p>
          <div className="flex flex-wrap gap-1.5">
            {PROPERTY_TYPES.map(t => (
              <Chip key={t} active={state.propertyType === t} onClick={() => onChange({ propertyType: t })}>{t}</Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-muted">거래유형</p>
          <div className="flex flex-wrap gap-1.5">
            {DEAL_TYPES.map(t => (
              <Chip
                key={t}
                active={state.dealType === t}
                onClick={() => onChange({ dealType: t, priceBucket: '전체' })}
              >{t}</Chip>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="area-bucket" className="mb-1.5 block text-xs font-semibold text-muted">평수 구간</label>
          <select
            id="area-bucket"
            aria-label="평수 구간"
            value={state.areaBucket}
            onChange={e => onChange({ areaBucket: e.target.value as AreaBucket })}
            className="h-11 w-full rounded-md border border-hairline bg-canvas px-2 text-ink"
          >
            {AREA_BUCKETS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        {priceBuckets && (
          <div>
            <label htmlFor="price-bucket" className="mb-1.5 block text-xs font-semibold text-muted">가격 구간</label>
            <select
              id="price-bucket"
              aria-label="가격 구간"
              value={state.priceBucket}
              onChange={e => onChange({ priceBucket: e.target.value as PriceBucket })}
              className="h-11 w-full rounded-md border border-hairline bg-canvas px-2 text-ink"
            >
              <option value="전체">가격 전체</option>
              {priceBuckets.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/components/listings/FilterSidebar.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/listings/FilterSidebar.tsx src/components/listings/FilterSidebar.test.tsx
git commit -m "feat: FilterSidebar with type/deal/area/price filters"
```

---

### Task 6: ListingSearch (검색 엔진 + URL 동기화)

**Files:**
- Create: `src/components/listings/ListingSearch.tsx`
- Test: `src/components/listings/ListingSearch.test.tsx`
- Delete later (Task 13): `ListingBrowser.tsx`, `ListingBrowser.test.tsx`

**Interfaces:**
- Consumes: `applyFilters`, bucket types from `@/lib/listings`; `FilterSidebar`, `FilterState`; `ListingCard`; `UnitConverter`; `useSearchParams`, `useRouter`, `usePathname` from `next/navigation`.
- Produces: `<ListingSearch listings={Listing[]} />`. MUST be rendered inside a `<Suspense>` boundary by its parent page (because it calls `useSearchParams` under `force-static`).

URL params: `type`, `deal`, `area`, `price`. Missing param means `전체`.

- [ ] **Step 1: Write failing test**

```tsx
// src/components/listings/ListingSearch.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingSearch } from './ListingSearch';
import { rowToListing } from '@/lib/listings';
import { sampleRows } from '@/test/fixtures/listings';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/listings',
  useSearchParams: () => new URLSearchParams(''),
}));

const listings = sampleRows.filter(r => r.status === '공개').map(rowToListing);

describe('ListingSearch', () => {
  it('filters to 공장 when the 공장 chip is pressed', async () => {
    const user = userEvent.setup();
    render(<ListingSearch listings={listings} />);
    expect(screen.getByText('오류동 제조공장')).toBeInTheDocument();
    expect(screen.getByText('오류동 공장부지')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '공장' }));
    expect(screen.getByText('오류동 제조공장')).toBeInTheDocument();
    expect(screen.queryByText('오류동 공장부지')).toBeNull();
  });

  it('shows an empty-state message when nothing matches', async () => {
    const user = userEvent.setup();
    render(<ListingSearch listings={listings} />);
    await user.click(screen.getByRole('button', { name: '토지' }));
    await user.click(screen.getByRole('button', { name: '임대' }));
    expect(screen.getByText(/조건에 맞는 공개 매물이 없습니다/)).toBeInTheDocument();
  });
});
```

(Note: the exact listing titles come from `src/test/fixtures/listings`; the two titles above match the existing `ListingBrowser.test.tsx`. If fixture titles differ, mirror whatever that test used.)

- [ ] **Step 2: Run to verify fail**

Run: `npx vitest run src/components/listings/ListingSearch.test.tsx`
Expected: FAIL (component missing).

- [ ] **Step 3: Implement `src/components/listings/ListingSearch.tsx`**

```tsx
'use client';
import { useCallback, useMemo, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { applyFilters, type AreaBucket, type PriceBucket } from '@/lib/listings';
import type { Listing } from '@/lib/types';
import { FilterSidebar, type FilterState } from './FilterSidebar';
import { ListingCard } from './ListingCard';
import { UnitConverter } from './UnitConverter';

function stateFromParams(sp: URLSearchParams): FilterState {
  return {
    propertyType: (sp.get('type') as FilterState['propertyType']) || '전체',
    dealType: (sp.get('deal') as FilterState['dealType']) || '전체',
    areaBucket: (sp.get('area') as AreaBucket) || '전체',
    priceBucket: (sp.get('price') as PriceBucket) || '전체',
  };
}

export function ListingSearch({ listings }: { listings: Listing[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<FilterState>(() => stateFromParams(new URLSearchParams(searchParams.toString())));

  const syncUrl = useCallback((next: FilterState) => {
    const p = new URLSearchParams();
    if (next.propertyType !== '전체') p.set('type', next.propertyType);
    if (next.dealType !== '전체') p.set('deal', next.dealType);
    if (next.areaBucket !== '전체') p.set('area', next.areaBucket);
    if (next.priceBucket !== '전체') p.set('price', next.priceBucket);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [router, pathname]);

  const onChange = useCallback((patch: Partial<FilterState>) => {
    setState(prev => {
      const next = { ...prev, ...patch };
      syncUrl(next);
      return next;
    });
  }, [syncUrl]);

  const onReset = useCallback(() => {
    const next: FilterState = { propertyType: '전체', dealType: '전체', areaBucket: '전체', priceBucket: '전체' };
    setState(next);
    syncUrl(next);
  }, [syncUrl]);

  const shown = useMemo(() => applyFilters(listings, state), [listings, state]);

  return (
    <div className="space-y-4">
      <UnitConverter />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="order-2 lg:order-1">
          {shown.length === 0 ? (
            <p className="rounded-md border border-hairline bg-canvas py-16 text-center text-muted">
              조건에 맞는 공개 매물이 없습니다. 전화 주시면  찾아드립니다.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
        <div className="order-1 lg:order-2 lg:sticky lg:top-28 lg:self-start">
          <FilterSidebar state={state} resultCount={shown.length} onChange={onChange} onReset={onReset} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test**

Run: `npx vitest run src/components/listings/ListingSearch.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/listings/ListingSearch.tsx src/components/listings/ListingSearch.test.tsx
git commit -m "feat: ListingSearch engine with URL-synced filters"
```

---

### Task 7: 홈 페이지를 검색 페이지로 전환

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getPublishedListings` from `@/lib/listings`; `ListingSearch`; `siteConfig`. Wraps `ListingSearch` in `<Suspense>`.

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
import { Suspense } from 'react';
import { getPublishedListings } from '@/lib/listings';
import { ListingSearch } from '@/components/listings/ListingSearch';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

export default async function HomePage() {
  const listings = await getPublishedListings();
  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{siteConfig.positioning}</h1>
        <p className="mt-1 text-muted">인천 서구 공장·창고·토지 매물을 조건별로 확인하고 전화로 편하게 문의하세요.</p>
      </section>
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <ListingSearch listings={listings} />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 2: Build to verify static + Suspense are correct**

Run: `npm run build`
Expected: `/` prerenders as static content, no `useSearchParams` build error.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: home page is now the search page"
```

---

### Task 8: /listings 페이지를 ListingSearch로 전환

**Files:**
- Modify: `src/app/listings/page.tsx`

- [ ] **Step 1: Replace `src/app/listings/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getPublishedListings } from '@/lib/listings';
import { ListingSearch } from '@/components/listings/ListingSearch';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '매물검색',
  description: `인천 서구 오류동·검단 공장·창고·토지 매물. ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.siteUrl}/listings` },
};

export default async function ListingsPage() {
  const listings = await getPublishedListings();
  return (
    <div className="space-y-5">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">매물검색</h1>
        <p className="mt-1 text-muted">종류·거래유형·평수·가격으로 좁혀 보세요.</p>
      </section>
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <ListingSearch listings={listings} />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `/listings` prerenders static, no error.

- [ ] **Step 3: Commit**

```bash
git add src/app/listings/page.tsx
git commit -m "feat: /listings uses shared ListingSearch"
```

---

### Task 9: Header 재스킨 + 매매/임대 네비

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Test: `src/components/layout/Header.test.tsx` (keep phone/nav/mobile assertions green; `bg-canvas` stays)

**Interfaces:**
- Keep: `banner` has `bg-canvas`; links `매물검색`→`/listings`, `회사소개`→`/about`; mobile toggle labels `메뉴`/`메뉴 닫기`; mobile nav `모바일 메뉴` has `bg-canvas`.

- [ ] **Step 1: Add 매매/임대 to NAV_LINKS**

In `src/components/layout/Header.tsx`, change `NAV_LINKS`:

```tsx
const NAV_LINKS = [
  { href: '/listings', label: '매물검색' },
  { href: '/listings?deal=매매', label: '매매' },
  { href: '/listings?deal=임대', label: '임대' },
  { href: '/about', label: '회사소개' },
] as const;
```

- [ ] **Step 2: Tighten the brand mark radius**

In the same file, change the logo tile `rounded-full` to `rounded-md`, and the phone CTA `Button` keeps default (now `rounded-md` from Task 3). Leave `bg-canvas` on `<header>` and the mobile `<nav>` intact.

- [ ] **Step 3: Run Header test**

Run: `npx vitest run src/components/layout/Header.test.tsx`
Expected: PASS. (The 매물검색/회사소개/phone/mobile assertions are unaffected; new 매매/임대 links do not collide.)

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: header adds 매매/임대 nav, denser brand mark"
```

---

### Task 10: Footer 회사정보 밀집 재스킨

**Files:**
- Modify: `src/components/layout/Footer.tsx`
- Test: `src/components/layout/Footer.test.tsx` (keep registrationNumber/representative/address green)

- [ ] **Step 1: Tighten the footer callout radius and spacing**

In `src/components/layout/Footer.tsx`, change the right-hand callout box `rounded-2xl` to `rounded-md`, reduce the vertical padding of the grid (`py-6` → `py-5`), and keep every existing field (상호/대표/중개등록번호/소재지/전화/영업시간/네이버 지도 링크). Do not remove any legally-required field.

- [ ] **Step 2: Run Footer test**

Run: `npx vitest run src/components/layout/Footer.test.tsx`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat: denser footer company block"
```

---

### Task 11: 매물상세 + SpecTable 표 느낌 강화

**Files:**
- Modify: `src/components/listings/SpecTable.tsx` (add row dividers for a tabular look)
- Modify: `src/app/listings/[slug]/page.tsx` (tighten spacing only)
- Test: `src/components/listings/SpecTable.test.tsx` (keep green)

**Interfaces:**
- Keep `SpecTable` rendering the same `dt`/`dd` label/value pairs; test asserts `소재지`, `가격` present and `층고`/`전력` omitted when null.

- [ ] **Step 1: Add dividers to SpecTable**

In `src/components/listings/SpecTable.tsx`, change the row `<div key={k}>` wrapper to include a bottom hairline and small padding for a table feel, keeping the same `dt`/`dd`:

```tsx
<div key={k} className="border-b border-hairline pb-2">
  <dt className="text-sm text-muted">{k}</dt>
  <dd className="mt-0.5 text-lg font-semibold text-ink">{v}</dd>
</div>
```

Keep the outer `Card className="p-6"` and the grid.

- [ ] **Step 2: Tighten detail page spacing**

In `src/app/listings/[slug]/page.tsx`, change the `<article className="space-y-8">` to `space-y-6`. No other structural change.

- [ ] **Step 3: Run SpecTable test + build**

Run: `npx vitest run src/components/listings/SpecTable.test.tsx && npm run build`
Expected: PASS; detail pages prerender.

- [ ] **Step 4: Commit**

```bash
git add src/components/listings/SpecTable.tsx src/app/listings/[slug]/page.tsx
git commit -m "feat: tabular SpecTable, tighter detail spacing"
```

---

### Task 12: 회사소개 재스킨

**Files:**
- Modify: `src/app/about/page.tsx` (tighten spacing/radius only; keep fields)
- Test: `src/app/about/page.test.tsx` (keep address/registrationNumber green)

- [ ] **Step 1: Tighten about spacing**

In `src/app/about/page.tsx`, change `<div className="space-y-10">` to `space-y-6`, and the info `Card className="p-6"` stays (now `rounded-md` from Task 3). Keep all fields and the `NaverMap`.

- [ ] **Step 2: Run about test + build**

Run: `npx vitest run src/app/about/page.test.tsx && npm run build`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/app/about/page.tsx
git commit -m "feat: denser about page"
```

---

### Task 13: 폐기 컴포넌트 정리 + 전체 검증

**Files:**
- Delete: `src/components/listings/ListingBrowser.tsx`, `src/components/listings/ListingBrowser.test.tsx`
- Delete: `src/components/listings/FilterPanel.tsx`, `src/components/listings/FilterPanel.test.tsx`
- Delete: `src/components/layout/CallPanel.tsx`, `src/components/layout/CallPanel.test.tsx`

**Interfaces:**
- Precondition: nothing imports these three components anymore (home no longer uses `CallPanel`; `ListingBrowser`/`FilterPanel` replaced by `ListingSearch`/`FilterSidebar`).

- [ ] **Step 1: Verify no remaining imports**

Run: `npx grep -rn "ListingBrowser\|FilterPanel\|CallPanel" src` (or use the editor search)
Expected: only matches are the files being deleted. If any page still imports them, fix that import first.

- [ ] **Step 2: Delete the replaced files**

```bash
git rm src/components/listings/ListingBrowser.tsx src/components/listings/ListingBrowser.test.tsx \
       src/components/listings/FilterPanel.tsx src/components/listings/FilterPanel.test.tsx \
       src/components/layout/CallPanel.tsx src/components/layout/CallPanel.test.tsx
```

- [ ] **Step 3: Full verification gate**

Run each and confirm:

```bash
npx vitest run
npx tsc --noEmit
npx eslint .
npm run build
```

Expected: all pass; `eslint` clean except the pre-existing `layout.tsx` `PhoneCtaBar` unused-import warning (unchanged, out of scope). If a test referenced a deleted component, it was one of the deleted test files; no other test should break.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove ListingBrowser/FilterPanel/CallPanel replaced by search UI"
```

---

## Self-Review

**Spec coverage:**
- §4/§5 조밀 스타일·토큰 → Task 3 (+ per-component radius in 4,5,6,9,10,11,12). ✓
- §6 홈=검색, /listings 공유, 매매/임대 네비, URL 동기화 → Tasks 6,7,8,9. ✓
- §7.2 UnitConverter/FilterSidebar/ListingGrid → Tasks 2,5,6. ✓
- §7.1 Header/Footer → Tasks 9,10. ✓
- §7.3 상세/SpecTable → Task 11. ✓ §7.4 회사소개 → Task 12. ✓
- §8 필터 로직/버킷 → Task 1. ✓
- §9 폐기 → Task 13. ✓
- §10 접근성/가격표기 → Global Constraints + carried in each component (h-11, readable price via `formatDealPrice`). ✓
- §11 테스트 → each task TDD + Task 13 gate. ✓
- §3 비목표(문자상담/통계/관심등록/테마/경쟁사 자산) → not built anywhere. ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code. The one soft note (fixture titles in Task 6) points to the existing `ListingBrowser.test.tsx` titles to copy verbatim, not a placeholder.

**Type consistency:** `FilterState` (Task 5) is imported and used identically in Task 6. Bucket types/exports (`AreaBucket`, `PriceBucket`, `AREA_BUCKETS`, `SALE_PRICE_BUCKETS`, `RENT_PRICE_BUCKETS`) defined in Task 1, consumed in Tasks 5,6 with matching names. `onChange(patch: Partial<FilterState>)` signature consistent between FilterSidebar and ListingSearch. Converter helpers `m2ToPyeong`/`pyeongToM2` defined Task 2, used in same task.

**Note on 매매/임대 nav deep-links (Task 9):** `/listings?deal=매매` sets the initial filter via `ListingSearch`'s `stateFromParams`. Korean param values are URL-encoded by the browser; `useSearchParams().get('deal')` decodes them back to `매매`/`임대`. Verified consistent with Task 6 param keys (`type`/`deal`/`area`/`price`).
