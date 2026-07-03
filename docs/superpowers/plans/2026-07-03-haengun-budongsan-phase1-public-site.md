# 행운부동산 P1 — 공개 사이트 기반 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a live, fast, SEO-optimized public website for 행운부동산공인중개사사무소 that reads its listings from Supabase and funnels every visitor to a phone call.

**Architecture:** Next.js (App Router) statically generates every public page (home, 매물목록, 매물상세, 회사소개) at build time from a Supabase Postgres table. Pure logic (formatting, SEO/JSON-LD builders, data-access mapping/filtering) lives in small tested `lib/` modules; React presentational components consume typed domain objects. Naver 지도 loads client-side and **degrades to a plain map link when no API key is present**. Hosting is Netlify (free tier); the only interactive backend touchpoint in P1 is read-only.

**Tech Stack:** Next.js 16 (App Router, React 19), TypeScript (strict), Tailwind CSS v4, Supabase (`@supabase/supabase-js`), Vitest + React Testing Library + jsdom, Netlify.

> **Next 16 notes (accepted; `create-next-app@latest` resolves to 16):** Turbopack is the default bundler for dev AND `next build` — our static site builds fine on it. `params`/`searchParams` in pages are async (Promises) — the detail page awaits them. Because `fetch` defaults to no-store, data-reading pages must opt into static generation with `export const dynamic = 'force-static'` (see Global Constraints) so Supabase reads are baked at build.

## Global Constraints

Every task's requirements implicitly include this section.

- **운영비 ~0 / 유지보수 ~0:** free tiers only; no fragile automation in P1; public pages are static (SSG) so they cannot break at runtime.
- **전화 우선(phone-first):** every page shows a tappable phone number (`tel:`). P1 has **no lead-form submission** — the "찾는 매물" CTA opens the phone modal. (The request form + inbox + email land in P2.)
- **고령 사용자 UI:** base font `18px`, large tap targets (≥44px), high contrast, mobile-first. Korean UI copy.
- **⚖️ 공인중개사법 표시·광고 의무:** every listing card AND detail MUST show 종류(property type)·거래형태(deal type)·소재지(address)·면적(area)·가격(price). Every page footer MUST show 사무소 법정 정보: 상호·대표·중개등록번호·소재지·전화.
- **SSG enforcement (Next 16):** data-fetching pages — home, listings index, listing detail, and `sitemap.ts` — declare `export const dynamic = 'force-static'` so the Supabase reads are executed at build time and baked into static output (never per-request). Detail pages are additionally pinned to known params via `generateStaticParams` + `dynamicParams = false`. (P2 will swap these directives for on-demand revalidation.)
- **SEO:** static HTML (Naver Yeti bot handles JS poorly); per-page `<title>`/`description`; OG tags on every page; JSON-LD `RealEstateAgent` site-wide + per-listing `Product`; auto `sitemap.xml`/`robots.txt`; canonical URLs.
- **Naver map graceful degradation:** if `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` is empty, render an address + "네이버 지도에서 보기" link instead of the interactive map. Never crash on a missing key.
- **No secrets in the repo:** all keys via env vars. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose (RLS-guarded, read-only public).
- **Commits:** Conventional Commits one-liners. If a commit is authored by a Claude agent, append the trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- **Package manager:** npm. **Node:** 20 in production (`netlify.toml`); local dev may be newer.

### Testing note (read before starting)
Vitest/RTL **cannot render async Server Components**. Therefore TDD targets the pure `lib/` modules and the client/sync components — those get real failing-test-first cycles. The async server-component **pages** (home, list, detail) are verified by (a) the unit-tested functions and components they compose and (b) a green `npm run build` (their integration gate). Tasks that build such a page say so explicitly instead of faking a test. `next/image` is mocked in the Vitest setup so jsdom renders a plain `<img>`.

---

## File Structure

```
budongsan/
├─ next.config.mjs                 # images.remotePatterns for Supabase Storage
├─ netlify.toml                    # NODE_VERSION=20, build command
├─ vitest.config.ts                # jsdom, @ alias, setup file
├─ vitest.setup.ts                 # jest-dom matchers + next/image mock
├─ .env.local.example              # documents required env vars
├─ supabase/
│  ├─ schema.sql                   # 4 tables (listings/posts/inquiries/admin) + RLS
│  └─ seed.sql                     # 6 current listings
├─ public/
│  └─ og-default.png              # fallback OG image (dev replaces)
└─ src/
   ├─ lib/
   │  ├─ site.ts                   # siteConfig: legal office info + positioning + env
   │  ├─ types.ts                  # PropertyType/DealType/ListingStatus, ListingRow, Listing
   │  ├─ format.ts                 # formatPrice, formatArea, pyeong, formatDealPrice
   │  ├─ seo.ts                    # absoluteUrl, buildListingMetadata, buildOrgJsonLd, buildListingJsonLd
   │  └─ listings.ts               # supabase client, rowToListing, applyFilters, get* queries
   ├─ test/fixtures/listings.ts    # sample ListingRow[] used across tests
   ├─ components/
   │  ├─ layout/Header.tsx         # server: logo + nav + phone
   │  ├─ layout/Footer.tsx         # server: legal office info + map link
   │  ├─ layout/PhoneCtaBar.tsx    # server: fixed mobile bar / desktop float (tel:)
   │  ├─ layout/PhoneModal.tsx     # client: PhoneModalTrigger dialog
   │  ├─ seo/JsonLd.tsx            # server: <script type=ld+json>
   │  ├─ listings/ListingCard.tsx  # server: card w/ legal fields
   │  ├─ listings/ListingBrowser.tsx # client: filters + grid
   │  ├─ listings/ImageSlider.tsx  # client: swipe/prev/next/thumbs
   │  ├─ listings/SpecTable.tsx    # server: spec table (legal + detail fields)
   │  ├─ listings/ShareButtons.tsx # client: copy link + SMS
   │  └─ map/NaverMap.tsx          # client: map w/ link fallback
   └─ app/
      ├─ layout.tsx                # root: metadata, Header/Footer/PhoneCtaBar, org JSON-LD
      ├─ globals.css               # Tailwind v4 import + big-text/high-contrast theme
      ├─ page.tsx                  # home
      ├─ listings/page.tsx         # 매물 목록
      ├─ listings/[slug]/page.tsx  # 매물 상세
      ├─ about/page.tsx            # 회사소개
      ├─ not-found.tsx             # 404
      ├─ sitemap.ts               # dynamic sitemap
      └─ robots.ts                # robots
```

---

## Task 1: Project scaffold + tooling + siteConfig + theme

**Files:**
- Create (scaffold): `package.json`, `next.config.mjs`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `postcss.config.mjs`
- Create: `netlify.toml`, `vitest.config.ts`, `vitest.setup.ts`, `.env.local.example`
- Create: `src/lib/site.ts`
- Test: `src/lib/site.test.ts`

**Interfaces:**
- Produces: `siteConfig` — `{ name, shortName, representative, registrationNumber, phone, phoneHref, address, businessHours, positioning, siteUrl, naverMapClientId }` (all string fields). Every later task imports this from `@/lib/site`.

- [ ] **Step 1: Scaffold Next.js in place** (create-next-app allows a dir containing only `docs/.git/.gitignore`; move any other dir — e.g. `.claude/` — aside first)

```bash
mv .claude ../.claude-bak 2>/dev/null || true
npx create-next-app@latest . --ts --app --src-dir --tailwind --eslint --import-alias "@/*" --use-npm --yes
mv ../.claude-bak .claude 2>/dev/null || true
```

`create-next-app@latest` currently installs **Next 16** and may also generate `next.config.ts`, `AGENTS.md`, `CLAUDE.md`, and `README.md`. That is expected. Delete the generated `next.config.ts` (we use `.mjs` in Step 4); the `.md` files are harmless (leave or delete). Then restore our ignore rules (create-next-app overwrites `.gitignore`):

```bash
rm -f next.config.ts
grep -q 'settings.local.json' .gitignore || printf '\n# Claude Code local settings\n.claude/settings.local.json\n' >> .gitignore
grep -q '^.env.local$' .gitignore || printf '.env.local\n.env.*.local\n' >> .gitignore
grep -q 'superpowers' .gitignore || printf '\n# SDD scratch\n.superpowers/\n' >> .gitignore
# create-next-app's generic `.env*` rule would ignore our committed example — un-ignore it:
grep -q '!.env.local.example' .gitignore || printf '!.env.local.example\n' >> .gitignore
```

- [ ] **Step 2: Install test + data deps and add scripts**

```bash
npm install @supabase/supabase-js
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Add to `package.json` `"scripts"`: `"test": "vitest run"` and `"test:watch": "vitest"`.

- [ ] **Step 3: Configure Vitest**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
});
```

`vitest.setup.ts` (mock `next/image` so jsdom renders a plain `<img>`):
```ts
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, priority, sizes, ...rest }: Record<string, unknown>) =>
    React.createElement('img', rest as Record<string, unknown>),
}));
```

- [ ] **Step 4: Netlify + Next config + env example**

`netlify.toml`:
```toml
[build]
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"
```

`next.config.mjs` (allow Supabase Storage image host):
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
};
export default nextConfig;
```

`.env.local.example`:
```
# Supabase (public, read-only via RLS)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
# Public site URL (canonical/OG). Placeholder until domain is chosen.
NEXT_PUBLIC_SITE_URL=https://haengun.example.com
# Naver Cloud Maps client id — OPTIONAL. If empty, map degrades to a link.
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=
```

- [ ] **Step 5: Big-text / high-contrast theme**

Replace `src/app/globals.css` with:
```css
@import "tailwindcss";

@theme {
  --color-brand: #0b4a6f;
  --color-brand-dark: #08344e;
  --color-accent: #c8102e;
  --color-ink: #16202a;
  --color-muted: #4b5563;
}

html { font-size: 18px; }
body { color: var(--color-ink); background: #ffffff; -webkit-text-size-adjust: 100%; }
```

- [ ] **Step 6: Write the failing test for siteConfig**

`src/lib/site.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { siteConfig } from './site';

describe('siteConfig', () => {
  it('exposes all legally-required office fields as strings', () => {
    for (const key of ['name', 'representative', 'registrationNumber', 'phone', 'address', 'businessHours'] as const) {
      expect(typeof siteConfig[key]).toBe('string');
      expect(siteConfig[key].length).toBeGreaterThan(0);
    }
  });

  it('derives phoneHref as a tel: link', () => {
    expect(siteConfig.phoneHref.startsWith('tel:')).toBe(true);
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npx vitest run src/lib/site.test.ts`
Expected: FAIL — `Cannot find module './site'`.

- [ ] **Step 8: Implement siteConfig**

`src/lib/site.ts` (placeholder legal values in `< >` are **data** the dev fills from the owner before deploy — see Task 14; the shape is final):
```ts
export const siteConfig = {
  name: '행운부동산공인중개사사무소',
  shortName: '행운부동산',
  representative: '<대표자명>',
  registrationNumber: '<중개등록번호>',
  phone: '<사무소 전화번호>',
  phoneHref: 'tel:<숫자만-예: 0320000000>',
  address: '인천광역시 서구 오류동 <상세주소>',
  businessHours: '평일 09:00–18:00',
  positioning: '인천 서구 공장·토지, 25년 네트워크. 네이버에 없는 물건까지 연결합니다.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://haengun.example.com',
  naverMapClientId: process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? '',
} as const;
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run src/lib/site.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 10: Verify the app still builds**

Run: `npm run build`
Expected: build succeeds (default create-next-app home page + our globals). No Supabase needed yet.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app, testing, netlify config, siteConfig"
```

---

## Task 2: Supabase schema + seed + domain types + fixtures

**Files:**
- Create: `supabase/schema.sql`, `supabase/seed.sql`
- Create: `src/lib/types.ts`
- Create: `src/test/fixtures/listings.ts`
- Test: `src/test/fixtures/listings.test.ts`

**Interfaces:**
- Produces: `PropertyType = '공장'|'창고'|'토지'|'기타'`, `DealType = '매매'|'임대'`, `ListingStatus = '공개'|'거래완료'|'비공개'`.
- Produces: `ListingRow` (snake_case DB shape) and `Listing` (camelCase domain shape) — full field lists below. Consumed by every later task.
- Produces: `sampleRows: ListingRow[]` fixture.

**Note (deferral):** Step 3 (applying SQL to a live Supabase project) needs the owner's Supabase project and is a HUMAN step — skip it during subagent implementation; implement the files, types, fixtures, and fixture test only.

- [ ] **Step 1: Write the schema**

`supabase/schema.sql` (P1 uses only `listings`; the other three tables are created now so P2/P3 need no risky live migration):
```sql
create extension if not exists "pgcrypto";

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  property_type text not null check (property_type in ('공장','창고','토지','기타')),
  deal_type text not null check (deal_type in ('매매','임대')),
  status text not null default '공개' check (status in ('공개','거래완료','비공개')),
  address text not null,
  land_area_m2 numeric,
  building_area_m2 numeric,
  price bigint not null default 0,
  monthly_rent bigint,
  zoning text,
  land_category text,
  road_access text,
  ceiling_height_m numeric,
  power_capacity text,
  completion_year int,
  lat numeric,
  lng numeric,
  images text[] not null default '{}',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  kind text not null check (kind in ('가이드','리포트')),
  title text not null,
  body text not null,
  summary text,
  author text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists admin (
  id uuid primary key default gen_random_uuid(),
  pin_hash text not null,
  created_at timestamptz not null default now()
);

-- RLS: public may READ only visible content; writes are service-role only (P2 admin).
alter table listings enable row level security;
alter table posts enable row level security;
alter table inquiries enable row level security;
alter table admin enable row level security;

drop policy if exists "public reads open listings" on listings;
create policy "public reads open listings" on listings
  for select using (status = '공개');

drop policy if exists "public reads published posts" on posts;
create policy "public reads published posts" on posts
  for select using (published = true);
-- inquiries/admin: no public policy → anon fully denied (P2 adds authed access).
```

- [ ] **Step 2: Write the seed (6 listings)**

`supabase/seed.sql` — replace values with the owner's 6 real listings before deploy; keep 6 rows and valid enum values:
```sql
insert into listings (slug, title, property_type, deal_type, status, address, land_area_m2, building_area_m2, price, monthly_rent, zoning, land_category, road_access, ceiling_height_m, power_capacity, completion_year, lat, lng, images, description) values
('seogu-oryu-factory-01','오류동 도로변 제조공장','공장','매매','공개','인천광역시 서구 오류동 000-0',1653,992,1850000000,null,'계획관리지역','공장용지','6m 도로 접함',8,'150kW',2015,37.5701,126.6650,'{}','오류동 사거리 인근, 진입 6m 도로. 층고 8m, 전력 150kW.'),
('seogu-geomdan-warehouse-01','검단 물류창고 임대','창고','임대','공개','인천광역시 서구 왕길동 000-0',3305,2479,300000000,9000000,'일반공업지역','창고용지','8m 도로 접함',10,'100kW',2019,37.6060,126.6480,'{}','검단산업단지 인접 물류창고. 보증금 3억 / 월 900만원.'),
('seogu-oryu-land-01','오류동 공장부지 토지','토지','매매','공개','인천광역시 서구 오류동 000-0',2645,null,2100000000,null,'계획관리지역','전','6m 도로 접함',null,null,null,37.5680,126.6620,'{}','공장 인허가 가능 부지. 도로 접함.'),
('seogu-geomdan-factory-02','검단 신축 공장','공장','매매','공개','인천광역시 서구 원당동 000-0',991,661,1350000000,null,'준공업지역','공장용지','6m 도로 접함',7,'100kW',2022,37.6010,126.6700,'{}','신축 공장, 즉시 입주.'),
('seogu-gajwa-warehouse-02','가좌동 소형 창고 임대','창고','임대','공개','인천광역시 서구 가좌동 000-0',826,661,150000000,4500000,'일반공업지역','창고용지','6m 도로 접함',6,'50kW',2010,37.5040,126.6790,'{}','소형 창고, 보증금 1.5억 / 월 450만원.'),
('seogu-daegok-land-02','대곡동 개발예정 토지','토지','매매','공개','인천광역시 서구 대곡동 000-0',4132,null,1600000000,null,'계획관리지역','임야','4m 도로 접함',null,null,null,37.6150,126.6900,'{}','개발 호재 인근 토지.');
```

- [ ] **Step 3 (HUMAN, deferred): Apply schema + seed to the Supabase project**

In the Supabase dashboard → SQL Editor, paste and run `schema.sql`, then `seed.sql`. (Or `psql "$SUPABASE_DB_URL" -f supabase/schema.sql -f supabase/seed.sql`.)
Verify: run `select count(*) from listings where status = '공개';`
Expected: `6`.

- [ ] **Step 4: Define domain types**

`src/lib/types.ts`:
```ts
export type PropertyType = '공장' | '창고' | '토지' | '기타';
export type DealType = '매매' | '임대';
export type ListingStatus = '공개' | '거래완료' | '비공개';

export interface ListingRow {
  id: string;
  slug: string;
  title: string;
  property_type: PropertyType;
  deal_type: DealType;
  status: ListingStatus;
  address: string;
  land_area_m2: number | null;
  building_area_m2: number | null;
  price: number;
  monthly_rent: number | null;
  zoning: string | null;
  land_category: string | null;
  road_access: string | null;
  ceiling_height_m: number | null;
  power_capacity: string | null;
  completion_year: number | null;
  lat: number | null;
  lng: number | null;
  images: string[];
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  propertyType: PropertyType;
  dealType: DealType;
  status: ListingStatus;
  address: string;
  landAreaM2: number | null;
  buildingAreaM2: number | null;
  price: number;
  monthlyRent: number | null;
  zoning: string | null;
  landCategory: string | null;
  roadAccess: string | null;
  ceilingHeightM: number | null;
  powerCapacity: string | null;
  completionYear: number | null;
  lat: number | null;
  lng: number | null;
  images: string[];
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
```

- [ ] **Step 5: Write the failing fixture test**

`src/test/fixtures/listings.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { sampleRows } from './listings';

describe('sampleRows fixture', () => {
  it('has a factory-sale, a land row, and a hidden row for filter/RLS tests', () => {
    expect(sampleRows.some(r => r.property_type === '공장' && r.deal_type === '매매')).toBe(true);
    expect(sampleRows.some(r => r.property_type === '토지')).toBe(true);
    expect(sampleRows.some(r => r.status === '비공개')).toBe(true);
  });

  it('every row carries the legally-required display fields', () => {
    for (const r of sampleRows) {
      expect(r.address.length).toBeGreaterThan(0);
      expect(typeof r.price).toBe('number');
      expect(['공장', '창고', '토지', '기타']).toContain(r.property_type);
      expect(['매매', '임대']).toContain(r.deal_type);
    }
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run src/test/fixtures/listings.test.ts`
Expected: FAIL — `Cannot find module './listings'`.

- [ ] **Step 7: Implement the fixture**

`src/test/fixtures/listings.ts`:
```ts
import type { ListingRow } from '@/lib/types';

export const sampleRows: ListingRow[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'factory-sale-01', title: '오류동 제조공장',
    property_type: '공장', deal_type: '매매', status: '공개',
    address: '인천광역시 서구 오류동 000-0',
    land_area_m2: 1000, building_area_m2: 600, price: 1850000000, monthly_rent: null,
    zoning: '계획관리지역', land_category: '공장용지', road_access: '6m 도로 접함',
    ceiling_height_m: 8, power_capacity: '150kW', completion_year: 2015,
    lat: 37.57, lng: 126.665, images: ['https://x.supabase.co/a.jpg', 'https://x.supabase.co/b.jpg'],
    description: '설명', created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    slug: 'land-lease-01', title: '오류동 공장부지',
    property_type: '토지', deal_type: '임대', status: '공개',
    address: '인천광역시 서구 오류동 111-1',
    land_area_m2: 2000, building_area_m2: null, price: 300000000, monthly_rent: 5000000,
    zoning: '계획관리지역', land_category: '전', road_access: '6m 도로 접함',
    ceiling_height_m: null, power_capacity: null, completion_year: null,
    lat: 37.568, lng: 126.662, images: [],
    description: null, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    slug: 'hidden-01', title: '비공개 창고',
    property_type: '창고', deal_type: '매매', status: '비공개',
    address: '인천광역시 서구 왕길동 222-2',
    land_area_m2: 1500, building_area_m2: 900, price: 900000000, monthly_rent: null,
    zoning: '일반공업지역', land_category: '창고용지', road_access: '8m 도로 접함',
    ceiling_height_m: 10, power_capacity: '100kW', completion_year: 2019,
    lat: 37.606, lng: 126.648, images: ['https://x.supabase.co/c.jpg'],
    description: '비공개', created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-01T00:00:00Z',
  },
];
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run src/test/fixtures/listings.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Supabase schema, seed, domain types, test fixtures"
```

---

## Task 3: Formatters (`lib/format.ts`)

**Files:**
- Create: `src/lib/format.ts`
- Test: `src/lib/format.test.ts`

**Interfaces:**
- Consumes: `Listing` (for `formatDealPrice`'s parameter type).
- Produces: `formatPrice(won: number): string`, `pyeong(m2: number): number`, `formatArea(m2: number | null | undefined): string`, `formatDealPrice(l: Pick<Listing,'dealType'|'price'|'monthlyRent'>): string`.

- [ ] **Step 1: Write the failing tests**

`src/lib/format.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { formatPrice, formatArea, pyeong, formatDealPrice } from './format';

describe('formatPrice', () => {
  it('formats 억 and 만원', () => {
    expect(formatPrice(350_000_000)).toBe('3억 5,000만원');
    expect(formatPrice(12_000_000)).toBe('1,200만원');
    expect(formatPrice(100_000_000)).toBe('1억원');
  });
  it('handles zero/invalid as 가격문의', () => {
    expect(formatPrice(0)).toBe('가격문의');
    expect(formatPrice(-5)).toBe('가격문의');
  });
});

describe('formatArea / pyeong', () => {
  it('converts ㎡ to 평 and formats', () => {
    expect(pyeong(1000)).toBe(303);
    expect(formatArea(1000)).toBe('1,000㎡ (약 303평)');
  });
  it('returns dash for null', () => {
    expect(formatArea(null)).toBe('-');
  });
});

describe('formatDealPrice', () => {
  it('labels 매매', () => {
    expect(formatDealPrice({ dealType: '매매', price: 1_850_000_000, monthlyRent: null })).toBe('매매 18억 5,000만원');
  });
  it('labels 임대 with deposit and monthly rent', () => {
    expect(formatDealPrice({ dealType: '임대', price: 300_000_000, monthlyRent: 9_000_000 })).toBe('임대 보증금 3억원 / 월 900만원');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/format.test.ts`
Expected: FAIL — `Cannot find module './format'`.

- [ ] **Step 3: Implement the formatters**

`src/lib/format.ts`:
```ts
import type { Listing } from './types';

const PYEONG_PER_M2 = 3.305785;

export function formatPrice(won: number): string {
  if (!Number.isFinite(won) || won <= 0) return '가격문의';
  const eok = Math.floor(won / 100_000_000);
  const man = Math.floor((won % 100_000_000) / 10_000);
  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok}억`);
  if (man > 0) parts.push(`${man.toLocaleString('ko-KR')}만`);
  return parts.length ? `${parts.join(' ')}원` : `${won.toLocaleString('ko-KR')}원`;
}

export function pyeong(m2: number): number {
  return Math.round(m2 / PYEONG_PER_M2);
}

export function formatArea(m2: number | null | undefined): string {
  if (m2 == null || !Number.isFinite(m2) || m2 <= 0) return '-';
  return `${m2.toLocaleString('ko-KR')}㎡ (약 ${pyeong(m2).toLocaleString('ko-KR')}평)`;
}

export function formatDealPrice(l: Pick<Listing, 'dealType' | 'price' | 'monthlyRent'>): string {
  if (l.dealType === '임대') {
    const deposit = `임대 보증금 ${formatPrice(l.price)}`;
    return l.monthlyRent && l.monthlyRent > 0 ? `${deposit} / 월 ${formatPrice(l.monthlyRent)}` : deposit;
  }
  return `매매 ${formatPrice(l.price)}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/format.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/format.ts src/lib/format.test.ts
git commit -m "feat: add price/area/deal formatters"
```

---

## Task 4: SEO builders (`lib/seo.ts`)

**Files:**
- Create: `src/lib/seo.ts`
- Test: `src/lib/seo.test.ts`

**Interfaces:**
- Consumes: `siteConfig` (`@/lib/site`), `Listing` (`@/lib/types`), `formatArea`/`formatDealPrice` (`@/lib/format`).
- Produces: `absoluteUrl(path: string): string`, `buildListingMetadata(l: Listing): Metadata`, `buildOrgJsonLd(): object`, `buildListingJsonLd(l: Listing): object`.

- [ ] **Step 1: Write the failing tests**

`src/lib/seo.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { absoluteUrl, buildListingMetadata, buildOrgJsonLd, buildListingJsonLd } from './seo';
import type { Listing } from './types';

// Self-contained literal — this task must not depend on Task 5's rowToListing.
const factory: Listing = {
  id: '1', slug: 'factory-sale-01', title: '오류동 제조공장',
  propertyType: '공장', dealType: '매매', status: '공개',
  address: '인천광역시 서구 오류동 000-0',
  landAreaM2: 1000, buildingAreaM2: 600, price: 1_850_000_000, monthlyRent: null,
  zoning: '계획관리지역', landCategory: '공장용지', roadAccess: '6m 도로 접함',
  ceilingHeightM: 8, powerCapacity: '150kW', completionYear: 2015,
  lat: 37.57, lng: 126.665, images: ['https://x.supabase.co/a.jpg'],
  description: '설명', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z',
};

describe('absoluteUrl', () => {
  it('joins a path onto siteConfig.siteUrl', () => {
    expect(absoluteUrl('/listings/x')).toMatch(/\/listings\/x$/);
    expect(absoluteUrl('/listings/x').startsWith('http')).toBe(true);
  });
});

describe('buildListingMetadata', () => {
  it('sets a canonical url containing the slug and an OG image', () => {
    const m = buildListingMetadata(factory);
    expect(String(m.alternates?.canonical)).toMatch(/\/listings\/factory-sale-01$/);
    expect(m.openGraph?.images).toBeTruthy();
    expect(String(m.title)).toContain(factory.title);
  });
});

describe('buildOrgJsonLd', () => {
  it('is a RealEstateAgent with the office name', () => {
    const o = buildOrgJsonLd() as Record<string, unknown>;
    expect(o['@type']).toBe('RealEstateAgent');
    expect(o.name).toBeTruthy();
  });
});

describe('buildListingJsonLd', () => {
  it('is a Product whose Offer price matches the listing price in KRW', () => {
    const j = buildListingJsonLd(factory) as { '@type': string; offers: { price: number; priceCurrency: string } };
    expect(j['@type']).toBe('Product');
    expect(j.offers.price).toBe(factory.price);
    expect(j.offers.priceCurrency).toBe('KRW');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/seo.test.ts`
Expected: FAIL — `Cannot find module './seo'`.

- [ ] **Step 3: Implement the SEO builders**

`src/lib/seo.ts`:
```ts
import type { Metadata } from 'next';
import { siteConfig } from './site';
import type { Listing } from './types';
import { formatArea, formatDealPrice } from './format';

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.siteUrl).toString();
}

export function buildListingMetadata(l: Listing): Metadata {
  const title = `${l.title} | ${siteConfig.shortName}`;
  const description = `${l.address} · ${l.propertyType} ${l.dealType} · ${formatArea(l.landAreaM2)} · ${formatDealPrice(l)}. 인천 서구 공장·창고·토지 전문 ${siteConfig.name}.`;
  const url = absoluteUrl(`/listings/${l.slug}`);
  const image = l.images[0] ?? absoluteUrl('/og-default.png');
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website', siteName: siteConfig.name, images: [{ url: image }] },
  };
}

export function buildOrgJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: siteConfig.name,
    telephone: siteConfig.phone,
    url: siteConfig.siteUrl,
    areaServed: '인천광역시 서구',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'KR',
      addressLocality: '인천광역시 서구',
      streetAddress: siteConfig.address,
    },
  };
}

export function buildListingJsonLd(l: Listing): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: l.title,
    description: l.description ?? `${l.address} ${l.propertyType} ${l.dealType}`,
    image: l.images,
    category: l.propertyType,
    offers: {
      '@type': 'Offer',
      price: l.price,
      priceCurrency: 'KRW',
      availability: l.status === '공개' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: absoluteUrl(`/listings/${l.slug}`),
    },
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/seo.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo.ts src/lib/seo.test.ts
git commit -m "feat: add SEO metadata and JSON-LD builders"
```

---

## Task 5: Data-access layer (`lib/listings.ts`)

**Files:**
- Create: `src/lib/listings.ts`
- Test: `src/lib/listings.test.ts`

**Interfaces:**
- Consumes: `@supabase/supabase-js` (`createClient`, `SupabaseClient`), `Listing`/`ListingRow`/`PropertyType`/`DealType` (`@/lib/types`).
- Produces: `rowToListing(r: ListingRow): Listing`; `ListingFilter = { propertyType?: PropertyType|'전체'; dealType?: DealType|'전체' }`; `applyFilters(listings: Listing[], f: ListingFilter): Listing[]`; `createSupabaseServerClient(): SupabaseClient`; `getPublishedListings(client?): Promise<Listing[]>`; `getFeaturedListings(limit?, client?): Promise<Listing[]>`; `getListingBySlug(slug, client?): Promise<Listing | null>`; `getAllListingSlugs(client?): Promise<string[]>`.

- [ ] **Step 1: Write the failing tests**

`src/lib/listings.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { rowToListing, applyFilters, getPublishedListings, getListingBySlug, getAllListingSlugs } from './listings';
import type { ListingRow } from './types';
import { sampleRows } from '@/test/fixtures/listings';

// Minimal thenable stand-in for the Supabase query builder.
function fakeClient(rows: ListingRow[]): SupabaseClient {
  const builder: Record<string, unknown> = {
    _rows: [...rows],
    select() { return this; },
    eq(col: string, val: unknown) { (this as any)._rows = (this as any)._rows.filter((r: any) => r[col] === val); return this; },
    order() { return this; },
    single() { const r = (this as any)._rows[0] ?? null; return Promise.resolve({ data: r, error: r ? null : { message: 'no rows' } }); },
    then(resolve: (v: { data: unknown; error: null }) => void) { resolve({ data: (this as any)._rows, error: null }); },
  };
  return { from() { return builder; } } as unknown as SupabaseClient;
}

describe('rowToListing', () => {
  it('maps snake_case row to camelCase domain object', () => {
    const l = rowToListing(sampleRows[0]);
    expect(l.propertyType).toBe('공장');
    expect(l.landAreaM2).toBe(1000);
    expect(l.monthlyRent).toBeNull();
    expect(l.images).toHaveLength(2);
  });
});

describe('applyFilters', () => {
  const listings = sampleRows.map(rowToListing);
  it('전체 returns everything', () => {
    expect(applyFilters(listings, { propertyType: '전체', dealType: '전체' })).toHaveLength(3);
  });
  it('filters by property type and deal type', () => {
    expect(applyFilters(listings, { propertyType: '공장' })).toHaveLength(1);
    expect(applyFilters(listings, { dealType: '임대' })).toHaveLength(1);
  });
});

describe('queries', () => {
  it('getPublishedListings returns only 공개 rows, mapped', async () => {
    const result = await getPublishedListings(fakeClient(sampleRows));
    expect(result).toHaveLength(2);
    expect(result.every(l => l.status === '공개')).toBe(true);
  });
  it('getListingBySlug returns the matching 공개 listing', async () => {
    const l = await getListingBySlug('factory-sale-01', fakeClient(sampleRows));
    expect(l?.slug).toBe('factory-sale-01');
  });
  it('getListingBySlug returns null when the slug is hidden/missing', async () => {
    const l = await getListingBySlug('hidden-01', fakeClient(sampleRows));
    expect(l).toBeNull();
  });
  it('getAllListingSlugs returns 공개 slugs only', async () => {
    const slugs = await getAllListingSlugs(fakeClient(sampleRows));
    expect(slugs).toContain('factory-sale-01');
    expect(slugs).not.toContain('hidden-01');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/listings.test.ts`
Expected: FAIL — `Cannot find module './listings'`.

- [ ] **Step 3: Implement the data-access layer**

`src/lib/listings.ts`:
```ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Listing, ListingRow, PropertyType, DealType } from './types';

export function rowToListing(r: ListingRow): Listing {
  return {
    id: r.id, slug: r.slug, title: r.title,
    propertyType: r.property_type, dealType: r.deal_type, status: r.status,
    address: r.address, landAreaM2: r.land_area_m2, buildingAreaM2: r.building_area_m2,
    price: r.price, monthlyRent: r.monthly_rent,
    zoning: r.zoning, landCategory: r.land_category, roadAccess: r.road_access,
    ceilingHeightM: r.ceiling_height_m, powerCapacity: r.power_capacity, completionYear: r.completion_year,
    lat: r.lat, lng: r.lng,
    images: r.images ?? [], description: r.description,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export interface ListingFilter {
  propertyType?: PropertyType | '전체';
  dealType?: DealType | '전체';
}

export function applyFilters(listings: Listing[], f: ListingFilter): Listing[] {
  return listings.filter(
    l =>
      (!f.propertyType || f.propertyType === '전체' || l.propertyType === f.propertyType) &&
      (!f.dealType || f.dealType === '전체' || l.dealType === f.dealType),
  );
}

export function createSupabaseServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars (NEXT_PUBLIC_SUPABASE_URL/ANON_KEY) are missing');
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getPublishedListings(client: SupabaseClient = createSupabaseServerClient()): Promise<Listing[]> {
  const { data, error } = await client.from('listings').select('*').eq('status', '공개').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as ListingRow[]) ?? []).map(rowToListing);
}

export async function getFeaturedListings(limit = 6, client?: SupabaseClient): Promise<Listing[]> {
  const all = await getPublishedListings(client);
  return all.slice(0, limit);
}

export async function getListingBySlug(slug: string, client: SupabaseClient = createSupabaseServerClient()): Promise<Listing | null> {
  const { data, error } = await client.from('listings').select('*').eq('slug', slug).eq('status', '공개').single();
  if (error || !data) return null;
  return rowToListing(data as ListingRow);
}

export async function getAllListingSlugs(client: SupabaseClient = createSupabaseServerClient()): Promise<string[]> {
  const { data, error } = await client.from('listings').select('slug').eq('status', '공개');
  if (error) throw error;
  return ((data as { slug: string }[]) ?? []).map(r => r.slug);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/listings.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/listings.ts src/lib/listings.test.ts
git commit -m "feat: add typed Supabase data-access layer"
```

---

## Task 6: Layout shell (Header, Footer, PhoneCtaBar, PhoneModal, JsonLd, root layout)

**Files:**
- Create: `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`, `src/components/layout/PhoneCtaBar.tsx`, `src/components/layout/PhoneModal.tsx`, `src/components/seo/JsonLd.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/components/layout/Footer.test.tsx`, `src/components/layout/PhoneModal.test.tsx`

**Interfaces:**
- Consumes: `siteConfig`, `buildOrgJsonLd`.
- Produces: `<Header/>`, `<Footer/>`, `<PhoneCtaBar/>`, `<PhoneModalTrigger label? className?/>`, `<JsonLd data/>`. Root layout renders them around `{children}`.

- [ ] **Step 1: Write the failing tests**

`src/components/layout/Footer.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';
import { siteConfig } from '@/lib/site';

describe('Footer', () => {
  it('shows the legally-required office fields', () => {
    render(<Footer />);
    expect(screen.getByText(new RegExp(siteConfig.registrationNumber))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(siteConfig.representative))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(siteConfig.address))).toBeInTheDocument();
  });
});
```

`src/components/layout/PhoneModal.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneModalTrigger } from './PhoneModal';
import { siteConfig } from '@/lib/site';

describe('PhoneModalTrigger', () => {
  it('opens a dialog with a tel: link when clicked, then closes', async () => {
    const user = userEvent.setup();
    render(<PhoneModalTrigger label="전화문의" />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: '전화문의' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(siteConfig.phone) })).toHaveAttribute('href', siteConfig.phoneHref);
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/layout`
Expected: FAIL — cannot find `./Footer` / `./PhoneModal`.

- [ ] **Step 3: Implement JsonLd**

`src/components/seo/JsonLd.tsx`:
```tsx
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
```

- [ ] **Step 4: Implement PhoneModal (client)**

`src/components/layout/PhoneModal.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { siteConfig } from '@/lib/site';

export function PhoneModalTrigger({ label = '📞 전화상담', className = '' }: { label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>{label}</button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="전화상담"
             className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
             onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center" onClick={e => e.stopPropagation()}>
            <p className="text-lg font-bold text-ink">{siteConfig.name}</p>
            <p className="mt-1 text-muted">{siteConfig.businessHours}</p>
            <a href={siteConfig.phoneHref} className="mt-4 block rounded-xl bg-accent py-4 text-2xl font-bold text-white">📞 {siteConfig.phone}</a>
            <button type="button" onClick={() => setOpen(false)} className="mt-3 text-muted underline">닫기</button>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 5: Implement Header, Footer, PhoneCtaBar (server)**

`src/components/layout/Header.tsx`:
```tsx
import Link from 'next/link';
import { siteConfig } from '@/lib/site';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-brand bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-bold text-brand">{siteConfig.shortName}</Link>
        <nav className="hidden gap-5 text-lg sm:flex">
          <Link href="/listings">매물</Link>
          <Link href="/about">회사소개</Link>
        </nav>
        <a href={siteConfig.phoneHref} className="whitespace-nowrap text-lg font-bold text-accent">📞 {siteConfig.phone}</a>
      </div>
    </header>
  );
}
```

`src/components/layout/Footer.tsx`:
```tsx
import { siteConfig } from '@/lib/site';

export function Footer() {
  const mapUrl = `https://map.naver.com/p/search/${encodeURIComponent(siteConfig.address)}`;
  return (
    <footer className="mt-16 border-t bg-gray-50 text-muted">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm leading-7">
        <p className="text-base font-bold text-ink">{siteConfig.name}</p>
        <p>대표: {siteConfig.representative} · 중개등록번호: {siteConfig.registrationNumber}</p>
        <p>소재지: {siteConfig.address}</p>
        <p>전화: <a href={siteConfig.phoneHref} className="font-semibold text-accent">{siteConfig.phone}</a> · {siteConfig.businessHours}</p>
        <p className="mt-2"><a href={mapUrl} target="_blank" rel="noopener noreferrer" className="underline">네이버 지도에서 사무소 위치 보기</a></p>
      </div>
    </footer>
  );
}
```

`src/components/layout/PhoneCtaBar.tsx`:
```tsx
import { siteConfig } from '@/lib/site';

export function PhoneCtaBar() {
  return (
    <>
      <a href={siteConfig.phoneHref} className="fixed inset-x-0 bottom-0 z-50 bg-accent py-4 text-center text-xl font-bold text-white sm:hidden">📞 지금 전화상담</a>
      <a href={siteConfig.phoneHref} className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 rounded-full bg-accent px-6 py-4 text-lg font-bold text-white shadow-lg sm:flex">📞 전화상담 {siteConfig.phone}</a>
    </>
  );
}
```

- [ ] **Step 6: Wire the root layout**

Replace `src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PhoneCtaBar } from '@/components/layout/PhoneCtaBar';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildOrgJsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: `${siteConfig.name} | 인천 서구 공장·창고·토지`, template: `%s | ${siteConfig.shortName}` },
  description: siteConfig.positioning,
  openGraph: { siteName: siteConfig.name, locale: 'ko_KR', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen pb-20 sm:pb-0">
        <JsonLd data={buildOrgJsonLd()} />
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <Footer />
        <PhoneCtaBar />
      </body>
    </html>
  );
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run src/components/layout`
Expected: PASS (Footer 1, PhoneModal 1).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add layout shell (header, footer, phone CTA/modal, org JSON-LD)"
```

---

## Task 7: Listing UI (ListingCard, ListingBrowser)

**Files:**
- Create: `src/components/listings/ListingCard.tsx`, `src/components/listings/ListingBrowser.tsx`
- Test: `src/components/listings/ListingCard.test.tsx`, `src/components/listings/ListingBrowser.test.tsx`

**Interfaces:**
- Consumes: `Listing`, `formatArea`/`formatDealPrice`, `applyFilters`.
- Produces: `<ListingCard listing={Listing}/>` (server), `<ListingBrowser listings={Listing[]}/>` (client).

- [ ] **Step 1: Write the failing tests**

`src/components/listings/ListingCard.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListingCard } from './ListingCard';
import { rowToListing } from '@/lib/listings';
import { sampleRows } from '@/test/fixtures/listings';

describe('ListingCard', () => {
  it('renders the legally-required fields (종류/거래/소재지/면적/가격)', () => {
    render(<ListingCard listing={rowToListing(sampleRows[0])} />);
    expect(screen.getByText(/공장 · 매매/)).toBeInTheDocument();
    expect(screen.getByText(/인천광역시 서구 오류동/)).toBeInTheDocument();
    expect(screen.getByText(/㎡/)).toBeInTheDocument();
    expect(screen.getByText(/매매 18억/)).toBeInTheDocument();
  });
});
```

`src/components/listings/ListingBrowser.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ListingBrowser } from './ListingBrowser';
import { rowToListing } from '@/lib/listings';
import { sampleRows } from '@/test/fixtures/listings';

const publicListings = sampleRows.filter(r => r.status === '공개').map(rowToListing);

describe('ListingBrowser', () => {
  it('filters to 공장 when the 공장 button is pressed', async () => {
    const user = userEvent.setup();
    render(<ListingBrowser listings={publicListings} />);
    expect(screen.getByText('오류동 제조공장')).toBeInTheDocument();
    expect(screen.getByText('오류동 공장부지')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '공장' }));
    expect(screen.getByText('오류동 제조공장')).toBeInTheDocument();
    expect(screen.queryByText('오류동 공장부지')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/listings`
Expected: FAIL — cannot find `./ListingCard` / `./ListingBrowser`.

- [ ] **Step 3: Implement ListingCard (server)**

`src/components/listings/ListingCard.tsx`:
```tsx
import Link from 'next/link';
import Image from 'next/image';
import type { Listing } from '@/lib/types';
import { formatArea, formatDealPrice } from '@/lib/format';

export function ListingCard({ listing: l }: { listing: Listing }) {
  return (
    <Link href={`/listings/${l.slug}`} className="block overflow-hidden rounded-xl border transition hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-gray-100">
        {l.images[0] ? (
          <Image src={l.images[0]} alt={l.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">사진 준비중</div>
        )}
        <span className="absolute left-2 top-2 rounded bg-brand px-2 py-1 text-sm text-white">{l.propertyType} · {l.dealType}</span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-lg font-bold text-ink">{l.title}</h3>
        <p className="text-muted">{l.address}</p>
        <p className="mt-1">{formatArea(l.landAreaM2)}</p>
        <p className="text-lg font-bold text-accent">{formatDealPrice(l)}</p>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Implement ListingBrowser (client)**

`src/components/listings/ListingBrowser.tsx`:
```tsx
'use client';
import { useState } from 'react';
import type { Listing, PropertyType, DealType } from '@/lib/types';
import { applyFilters } from '@/lib/listings';
import { ListingCard } from './ListingCard';

const TYPES: (PropertyType | '전체')[] = ['전체', '공장', '창고', '토지', '기타'];
const DEALS: (DealType | '전체')[] = ['전체', '매매', '임대'];

export function ListingBrowser({ listings }: { listings: Listing[] }) {
  const [type, setType] = useState<PropertyType | '전체'>('전체');
  const [deal, setDeal] = useState<DealType | '전체'>('전체');
  const shown = applyFilters(listings, { propertyType: type, dealType: deal });

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {TYPES.map(t => (
          <button key={t} type="button" onClick={() => setType(t)} aria-pressed={type === t}
                  className={`rounded-full border px-4 py-2 text-lg ${type === t ? 'bg-brand text-white' : 'bg-white'}`}>{t}</button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {DEALS.map(d => (
          <button key={d} type="button" onClick={() => setDeal(d)} aria-pressed={deal === d}
                  className={`rounded-full border px-4 py-2 text-lg ${deal === d ? 'bg-accent text-white' : 'bg-white'}`}>{d}</button>
        ))}
      </div>
      {shown.length === 0 ? (
        <p className="py-10 text-center text-muted">조건에 맞는 공개 매물이 없습니다. 전화 주시면 비공개 매물까지 찾아드립니다.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/components/listings`
Expected: PASS (ListingCard 1, ListingBrowser 1).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add listing card and filterable listing browser"
```

---

## Task 8: Home page

**Files:**
- Modify/replace: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getFeaturedListings`, `<ListingCard/>`, `<PhoneModalTrigger/>`, `siteConfig`.

*Async Server Component — verified by `npm run build` plus the already-tested `getFeaturedListings`/`ListingCard`. No new unit test.*

- [ ] **Step 1: Implement the home page**

Replace `src/app/page.tsx`:
```tsx
import Link from 'next/link';
import { getFeaturedListings } from '@/lib/listings';
import { ListingCard } from '@/components/listings/ListingCard';
import { PhoneModalTrigger } from '@/components/layout/PhoneModal';
import { siteConfig } from '@/lib/site';

// Next 16: bake Supabase reads at build → static HTML for the Naver bot.
export const dynamic = 'force-static';

export default async function HomePage() {
  const listings = await getFeaturedListings(6);
  return (
    <div className="space-y-12">
      <section className="py-8 text-center">
        <h1 className="text-3xl font-extrabold leading-snug text-ink sm:text-4xl">{siteConfig.positioning}</h1>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={siteConfig.phoneHref} className="rounded-xl bg-accent px-8 py-4 text-xl font-bold text-white">📞 지금 전화상담</a>
          <PhoneModalTrigger label="찾는 매물 문의" className="rounded-xl border-2 border-brand px-8 py-4 text-xl font-bold text-brand" />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">대표 매물</h2>
          <Link href="/listings" className="text-lg text-brand underline">전체 매물 보기</Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      </section>

      <section className="rounded-2xl bg-brand p-8 text-center text-white">
        <p className="text-2xl font-bold">여기 없는 물건이 더 많습니다</p>
        <p className="mt-2 text-lg opacity-90">네이버에 안 올라온 비공개 공장·토지, 전화로 바로 확인하세요.</p>
        <a href={siteConfig.phoneHref} className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-lg font-bold text-brand">📞 {siteConfig.phone}</a>
      </section>

      <section className="grid gap-4 text-center sm:grid-cols-3">
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">25년</p><p className="mt-1 text-muted">인천 현장 경력</p></div>
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">공장·창고·토지</p><p className="mt-1 text-muted">B2B 전문</p></div>
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">네트워크</p><p className="mt-1 text-muted">비공개 매물 연결</p></div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify the build (integration gate — needs Supabase env)**

Ensure `.env.local` has the Supabase vars (copy from `.env.local.example`, fill real values), then run: `npm run build`
Expected: build succeeds; the home route is statically generated (`○`/`●` in the build output, not `ƒ`).

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: build home page (hero, featured listings, hidden-stock banner, trust block)"
```

---

## Task 9: Listings list page

**Files:**
- Create: `src/app/listings/page.tsx`

**Interfaces:**
- Consumes: `getPublishedListings`, `<ListingBrowser/>`, `siteConfig`.

*Async Server Component — verified by `npm run build` + tested `ListingBrowser`/data-access. No new unit test.*

- [ ] **Step 1: Implement the list page**

`src/app/listings/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { getPublishedListings } from '@/lib/listings';
import { ListingBrowser } from '@/components/listings/ListingBrowser';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: '매물 목록',
  description: `인천 서구 오류동·검단 공장·창고·토지 매물. ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.siteUrl}/listings` },
};

export default async function ListingsPage() {
  const listings = await getPublishedListings();
  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold">매물 목록</h1>
      <ListingBrowser listings={listings} />
      <div className="mt-10 rounded-2xl bg-gray-50 p-8 text-center">
        <p className="text-xl font-bold">못 찾으셨나요?</p>
        <p className="mt-1 text-muted">전화 주시면 비공개 매물까지 찾아드립니다.</p>
        <a href={siteConfig.phoneHref} className="mt-4 inline-block rounded-xl bg-accent px-6 py-3 text-lg font-bold text-white">📞 {siteConfig.phone}</a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: succeeds; `/listings` statically generated.

- [ ] **Step 3: Commit**

```bash
git add src/app/listings/page.tsx
git commit -m "feat: build listings index page"
```

---

## Task 10: Detail sub-components (ImageSlider, SpecTable, ShareButtons, NaverMap)

**Files:**
- Create: `src/components/listings/ImageSlider.tsx`, `src/components/listings/SpecTable.tsx`, `src/components/listings/ShareButtons.tsx`, `src/components/map/NaverMap.tsx`
- Test: `src/components/listings/ImageSlider.test.tsx`, `src/components/listings/SpecTable.test.tsx`, `src/components/listings/ShareButtons.test.tsx`, `src/components/map/NaverMap.test.tsx`

**Interfaces:**
- Produces: `<ImageSlider images={string[]} alt={string}/>`, `<SpecTable listing={Listing}/>`, `<ShareButtons slug={string} title={string}/>`, `<NaverMap lat={number|null} lng={number|null} address={string}/>`.

- [ ] **Step 1: Write the failing tests**

`src/components/listings/ImageSlider.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageSlider } from './ImageSlider';

describe('ImageSlider', () => {
  it('shows a placeholder when there are no images', () => {
    render(<ImageSlider images={[]} alt="매물" />);
    expect(screen.getByText('사진 준비중')).toBeInTheDocument();
  });
  it('advances to the next image', async () => {
    const user = userEvent.setup();
    render(<ImageSlider images={['/a.jpg', '/b.jpg']} alt="매물" />);
    expect(screen.getByAltText('매물 사진 1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '다음 사진' }));
    expect(screen.getByAltText('매물 사진 2')).toBeInTheDocument();
  });
});
```

`src/components/listings/SpecTable.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpecTable } from './SpecTable';
import { rowToListing } from '@/lib/listings';
import { sampleRows } from '@/test/fixtures/listings';

describe('SpecTable', () => {
  it('renders required fields and omits empty ones', () => {
    render(<SpecTable listing={rowToListing(sampleRows[1])} />); // 토지, no 층고/전력
    expect(screen.getByText('소재지')).toBeInTheDocument();
    expect(screen.getByText('가격')).toBeInTheDocument();
    expect(screen.queryByText('층고')).toBeNull();
    expect(screen.queryByText('전력')).toBeNull();
  });
});
```

`src/components/listings/ShareButtons.test.tsx`:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareButtons } from './ShareButtons';
import { siteConfig } from '@/lib/site';

describe('ShareButtons', () => {
  it('copies the canonical listing URL to the clipboard', () => {
    // Scope the stub to navigator.clipboard (do NOT replace navigator wholesale).
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    vi.stubGlobal('alert', vi.fn()); // jsdom has no window.alert
    render(<ShareButtons slug="factory-sale-01" title="공장" />);
    // writeText is invoked synchronously before the handler's await, so no await needed.
    fireEvent.click(screen.getByRole('button', { name: '링크복사' }));
    expect(writeText).toHaveBeenCalledWith(`${siteConfig.siteUrl}/listings/factory-sale-01`);
    vi.unstubAllGlobals();
  });
  it('offers an SMS link containing the URL', () => {
    render(<ShareButtons slug="factory-sale-01" title="공장" />);
    expect(screen.getByRole('link', { name: '문자' }).getAttribute('href')).toContain('factory-sale-01');
  });
});
```

`src/components/map/NaverMap.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NaverMap } from './NaverMap';

// siteConfig.naverMapClientId is '' in the test env → fallback branch.
describe('NaverMap (no key)', () => {
  it('renders a Naver map search link with the address', () => {
    render(<NaverMap lat={37.5} lng={126.6} address="인천 서구 오류동 000" />);
    const link = screen.getByRole('link', { name: /네이버 지도에서 위치 보기/ });
    expect(link.getAttribute('href')).toContain(encodeURIComponent('인천 서구 오류동 000'));
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/listings/ImageSlider.test.tsx src/components/listings/SpecTable.test.tsx src/components/listings/ShareButtons.test.tsx src/components/map/NaverMap.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement ImageSlider (client)**

`src/components/listings/ImageSlider.tsx`:
```tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';

export function ImageSlider({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) {
    return <div className="flex aspect-video items-center justify-center rounded-xl bg-gray-100 text-muted">사진 준비중</div>;
  }
  const prev = () => setI(v => (v - 1 + images.length) % images.length);
  const next = () => setI(v => (v + 1) % images.length);
  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-gray-100">
        <Image src={images[i]} alt={`${alt} 사진 ${i + 1}`} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" priority />
        {images.length > 1 && (
          <>
            <button type="button" onClick={prev} aria-label="이전 사진" className="absolute left-2 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-black/50 text-2xl text-white">‹</button>
            <button type="button" onClick={next} aria-label="다음 사진" className="absolute right-2 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-black/50 text-2xl text-white">›</button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {images.map((src, idx) => (
            <button key={src} type="button" onClick={() => setI(idx)} aria-label={`사진 ${idx + 1} 보기`} aria-current={i === idx}
                    className={`relative h-16 w-16 overflow-hidden rounded border-2 ${i === idx ? 'border-accent' : 'border-transparent'}`}>
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Implement SpecTable (server)**

`src/components/listings/SpecTable.tsx`:
```tsx
import type { Listing } from '@/lib/types';
import { formatArea, formatDealPrice } from '@/lib/format';

export function SpecTable({ listing: l }: { listing: Listing }) {
  const rows: [string, string | null][] = [
    ['종류', `${l.propertyType} · ${l.dealType}`],
    ['소재지', l.address],
    ['가격', formatDealPrice(l)],
    ['대지면적', l.landAreaM2 != null ? formatArea(l.landAreaM2) : null],
    ['건물면적', l.buildingAreaM2 != null ? formatArea(l.buildingAreaM2) : null],
    ['용도지역', l.zoning],
    ['지목', l.landCategory],
    ['도로', l.roadAccess],
    ['층고', l.ceilingHeightM != null ? `${l.ceilingHeightM}m` : null],
    ['전력', l.powerCapacity],
    ['준공', l.completionYear != null ? `${l.completionYear}년` : null],
  ];
  return (
    <table className="w-full border-t text-lg">
      <tbody>
        {rows.filter(([, v]) => v != null && v !== '').map(([k, v]) => (
          <tr key={k} className="border-b">
            <th scope="row" className="w-28 py-3 pr-4 text-left align-top font-semibold text-muted">{k}</th>
            <td className="py-3 text-ink">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 5: Implement ShareButtons (client)**

`src/components/listings/ShareButtons.tsx`:
```tsx
'use client';
import { siteConfig } from '@/lib/site';

export function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const url = `${siteConfig.siteUrl}/listings/${slug}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('링크를 복사했습니다');
    } catch {
      prompt('아래 링크를 복사하세요', url);
    }
  };
  const sms = `sms:?body=${encodeURIComponent(`${title} ${url}`)}`;
  return (
    <div className="flex gap-2">
      <button type="button" onClick={copy} className="rounded-lg border px-4 py-3 text-lg">링크복사</button>
      <a href={sms} className="rounded-lg border px-4 py-3 text-lg">문자</a>
    </div>
  );
}
```

- [ ] **Step 6: Implement NaverMap (client, with fallback)**

`src/components/map/NaverMap.tsx`:
```tsx
'use client';
import { useEffect, useRef } from 'react';
import { siteConfig } from '@/lib/site';

export function NaverMap({ lat, lng, address }: { lat: number | null; lng: number | null; address: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const hasKey = Boolean(siteConfig.naverMapClientId);
  const searchUrl = `https://map.naver.com/p/search/${encodeURIComponent(address)}`;

  useEffect(() => {
    if (!hasKey || lat == null || lng == null || !ref.current) return;
    const init = () => {
      const naver = (window as unknown as { naver?: { maps?: any } }).naver;
      if (!naver?.maps || !ref.current) return;
      const center = new naver.maps.LatLng(lat, lng);
      const map = new naver.maps.Map(ref.current, { center, zoom: 16 });
      new naver.maps.Marker({ position: center, map });
    };
    if ((window as unknown as { naver?: { maps?: unknown } }).naver?.maps) { init(); return; }
    const id = 'naver-map-sdk';
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = id;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${siteConfig.naverMapClientId}`;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener('load', init);
    return () => script?.removeEventListener('load', init);
  }, [hasKey, lat, lng]);

  if (!hasKey || lat == null || lng == null) {
    return (
      <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl border bg-gray-50 p-6 text-center text-lg">
        📍 {address}<br /><span className="text-brand underline">네이버 지도에서 위치 보기</span>
      </a>
    );
  }
  return <div ref={ref} className="h-72 w-full overflow-hidden rounded-xl bg-gray-100" aria-label={`${address} 지도`} />;
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run src/components/listings/ImageSlider.test.tsx src/components/listings/SpecTable.test.tsx src/components/listings/ShareButtons.test.tsx src/components/map/NaverMap.test.tsx`
Expected: PASS (ImageSlider 2, SpecTable 1, ShareButtons 2, NaverMap 1).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add detail sub-components (slider, spec table, share, naver map w/ fallback)"
```

---

## Task 11: Listing detail page

**Files:**
- Create: `src/app/listings/[slug]/page.tsx`
- Test: `src/app/listings/[slug]/generateStaticParams.test.ts`

**Interfaces:**
- Consumes: `getAllListingSlugs`/`getListingBySlug`, `buildListingMetadata`/`buildListingJsonLd`, `<JsonLd/>`, `<ImageSlider/>`, `<SpecTable/>`, `<ShareButtons/>`, `<NaverMap/>`, `siteConfig`.

- [ ] **Step 1: Write the failing test for generateStaticParams**

`src/app/listings/[slug]/generateStaticParams.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/listings', () => ({
  getAllListingSlugs: vi.fn().mockResolvedValue(['a', 'b']),
  getListingBySlug: vi.fn(),
}));

import { generateStaticParams } from './page';

describe('listing detail generateStaticParams', () => {
  it('returns one param object per published slug', async () => {
    await expect(generateStaticParams()).resolves.toEqual([{ slug: 'a' }, { slug: 'b' }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "src/app/listings/[slug]/generateStaticParams.test.ts"`
Expected: FAIL — cannot find `./page`.

- [ ] **Step 3: Implement the detail page**

`src/app/listings/[slug]/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllListingSlugs, getListingBySlug } from '@/lib/listings';
import { buildListingMetadata, buildListingJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/seo/JsonLd';
import { ImageSlider } from '@/components/listings/ImageSlider';
import { SpecTable } from '@/components/listings/SpecTable';
import { ShareButtons } from '@/components/listings/ShareButtons';
import { NaverMap } from '@/components/map/NaverMap';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllListingSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = await getListingBySlug(slug);
  return l ? buildListingMetadata(l) : {};
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const l = await getListingBySlug(slug);
  if (!l) notFound();

  return (
    <article className="space-y-8">
      <JsonLd data={buildListingJsonLd(l)} />
      <h1 className="text-3xl font-extrabold">{l.title}</h1>
      <ImageSlider images={l.images} alt={l.title} />
      <SpecTable listing={l} />
      {l.description && <div className="whitespace-pre-line text-lg leading-8">{l.description}</div>}
      <NaverMap lat={l.lat} lng={l.lng} address={l.address} />
      <ShareButtons slug={l.slug} title={l.title} />
      <div className="rounded-2xl bg-brand p-6 text-center text-white">
        <p className="text-xl font-bold">이 매물이 궁금하세요?</p>
        <p className="opacity-90">비슷한 조건의 비공개 매물도 있습니다.</p>
        <a href={siteConfig.phoneHref} className="mt-3 inline-block rounded-xl bg-white px-6 py-3 text-lg font-bold text-brand">📞 이 매물 문의</a>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "src/app/listings/[slug]/generateStaticParams.test.ts"`
Expected: PASS (1 test).

- [ ] **Step 5: Verify the build statically generates each listing (needs Supabase env)**

Run: `npm run build`
Expected: build output lists `/listings/[slug]` as SSG with the seeded slugs prerendered.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: build listing detail page with static params, metadata, JSON-LD"
```

---

## Task 12: sitemap + robots + not-found

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/not-found.tsx`
- Test: `src/app/sitemap.test.ts`, `src/app/robots.test.ts`

**Interfaces:**
- Consumes: `getAllListingSlugs`, `siteConfig`.
- Produces: default `sitemap()` and `robots()` route handlers.

- [ ] **Step 1: Write the failing tests**

`src/app/sitemap.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/listings', () => ({ getAllListingSlugs: vi.fn().mockResolvedValue(['a', 'b']) }));

import sitemap from './sitemap';
import { siteConfig } from '@/lib/site';

describe('sitemap', () => {
  it('includes static routes and one entry per listing', async () => {
    const entries = await sitemap();
    const urls = entries.map(e => e.url);
    expect(urls).toContain(`${siteConfig.siteUrl}`);
    expect(urls).toContain(`${siteConfig.siteUrl}/listings`);
    expect(urls).toContain(`${siteConfig.siteUrl}/about`);
    expect(urls).toContain(`${siteConfig.siteUrl}/listings/a`);
    expect(urls).toContain(`${siteConfig.siteUrl}/listings/b`);
  });
});
```

`src/app/robots.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import robots from './robots';
import { siteConfig } from '@/lib/site';

describe('robots', () => {
  it('points at the sitemap and disallows /admin', () => {
    const r = robots();
    expect(r.sitemap).toBe(`${siteConfig.siteUrl}/sitemap.xml`);
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule?.disallow).toContain('/admin');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/sitemap.test.ts src/app/robots.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement sitemap, robots, not-found**

`src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from 'next';
import { getAllListingSlugs } from '@/lib/listings';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.siteUrl;
  const slugs = await getAllListingSlugs();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/listings`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.6 },
  ];
  const listingRoutes: MetadataRoute.Sitemap = slugs.map(slug => ({
    url: `${base}/listings/${slug}`, changeFrequency: 'weekly', priority: 0.7,
  }));
  return [...staticRoutes, ...listingRoutes];
}
```

`src/app/robots.ts`:
```ts
import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin'] },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
```

`src/app/not-found.tsx`:
```tsx
import Link from 'next/link';
import { siteConfig } from '@/lib/site';

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-extrabold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-2 text-muted">주소가 바뀌었거나 매물이 내려갔을 수 있습니다.</p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/listings" className="rounded-xl border-2 border-brand px-6 py-3 text-lg font-bold text-brand">매물 보기</Link>
        <a href={siteConfig.phoneHref} className="rounded-xl bg-accent px-6 py-3 text-lg font-bold text-white">📞 전화상담</a>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/sitemap.test.ts src/app/robots.test.ts`
Expected: PASS (sitemap 1, robots 1).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add sitemap, robots, and 404 page"
```

---

## Task 13: 회사소개 page

**Files:**
- Create: `src/app/about/page.tsx`
- Test: `src/app/about/page.test.tsx`

**Interfaces:**
- Consumes: `siteConfig`, `<NaverMap/>`.

*This page is a **sync** server component (no data fetch), so it is unit-testable with RTL.*

- [ ] **Step 1: Write the failing test**

`src/app/about/page.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from './page';
import { siteConfig } from '@/lib/site';

describe('AboutPage', () => {
  it('states the 25-year network positioning and the registration number', () => {
    render(<AboutPage />);
    expect(screen.getAllByText(/25년/).length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(siteConfig.registrationNumber))).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/about/page.test.tsx`
Expected: FAIL — cannot find `./page`.

- [ ] **Step 3: Implement the about page**

`src/app/about/page.tsx` (the 25년 story / 거래 사례 copy is data the dev fills from the owner — see Task 14):
```tsx
import type { Metadata } from 'next';
import { NaverMap } from '@/components/map/NaverMap';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: '회사소개',
  description: `${siteConfig.name} — 인천 서구에서 25년, 공장·창고·토지 전문 네트워크.`,
  alternates: { canonical: `${siteConfig.siteUrl}/about` },
};

export default function AboutPage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-3xl font-extrabold">회사소개</h1>
        <p className="mt-4 text-xl leading-8">{siteConfig.positioning}</p>
      </section>

      <section className="rounded-2xl bg-gray-50 p-8">
        <h2 className="text-2xl font-bold">인천 서구에서 25년</h2>
        <p className="mt-3 text-lg leading-8 text-muted">
          오류동·검단·왕길동 일대 공장·창고·토지를 25년간 현장에서 중개해 왔습니다.
          데이터앱이 알 수 없는 &ldquo;왜 파는지, 얼마까지 되는지, 옆 필지가 어떻게 되는지&rdquo;를
          네트워크로 압니다. 네이버에 올라오지 않는 비공개 매물까지 연결합니다.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3 text-center">
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">25년</p><p className="mt-1 text-muted">인천 현장 경력</p></div>
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">공장·창고·토지</p><p className="mt-1 text-muted">B2B 전문</p></div>
        <div className="rounded-xl border p-6"><p className="text-3xl font-extrabold text-brand">비공개 매물</p><p className="mt-1 text-muted">네트워크 연결</p></div>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-bold">사무소 정보</h2>
        <p className="text-lg">상호: {siteConfig.name}</p>
        <p className="text-lg">대표: {siteConfig.representative}</p>
        <p className="text-lg">중개등록번호: {siteConfig.registrationNumber}</p>
        <p className="text-lg">소재지: {siteConfig.address}</p>
        <p className="text-lg">전화: <a href={siteConfig.phoneHref} className="font-bold text-accent">{siteConfig.phone}</a> · {siteConfig.businessHours}</p>
      </section>

      <NaverMap lat={null} lng={null} address={siteConfig.address} />

      <section className="rounded-2xl bg-brand p-8 text-center text-white">
        <p className="text-xl font-bold">조용히 제값에 팔고 싶으신가요?</p>
        <p className="mt-1 opacity-90">25년 매수자 네트워크로 연결해 드립니다.</p>
        <a href={siteConfig.phoneHref} className="mt-4 inline-block rounded-xl bg-white px-6 py-3 text-lg font-bold text-brand">📞 {siteConfig.phone}</a>
      </section>
    </div>
  );
}
```

*(About uses the map's fallback branch by passing `lat/lng = null`, so the office location always shows as a Naver map link regardless of the API key.)*

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/about/page.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: build 회사소개 (about) page"
```

---

## Task 14: Real data, full test/build gate, Netlify deploy, search registration

**Files:**
- Modify: `src/lib/site.ts` (real legal values), `supabase/seed.sql` (real 6 listings), `public/og-default.png`
- Verify: whole suite + production build + deploy

**Interfaces:** none (release task).

- [ ] **Step 1: Replace placeholder legal/business data**

In `src/lib/site.ts`, replace every `< >` placeholder with the owner's real values: 상호, 대표자명, **공인중개사 중개등록번호**, 사무소 전화(+`phoneHref` digits), 사무소 상세주소. In `src/app/about/page.tsx`, replace the 25년 story / 거래 사례 copy with the owner's real (anonymized) material. Add a real `public/og-default.png` (1200×630).

Verify no placeholders remain:
```bash
grep -rn "<[가-힣].*>" src/lib/site.ts || echo "no placeholders — OK"
```
Expected: `no placeholders — OK`.

- [ ] **Step 2: Replace seed with the real 6 listings and re-apply**

Update `supabase/seed.sql` with the owner's real 6 listings + real photo URLs (upload photos to a public Supabase Storage bucket first; paste the public URLs into `images`). Re-run the seed in the Supabase SQL editor.
Verify: `select count(*) from listings where status = '공개';` → `6`.

- [ ] **Step 3: Run the full test suite**

Run: `npm run test`
Expected: ALL tests pass (site, fixtures, format, seo, listings, Footer, PhoneModal, ListingCard, ListingBrowser, ImageSlider, SpecTable, ShareButtons, NaverMap, generateStaticParams, sitemap, robots, about).

- [ ] **Step 4: Production build gate**

Ensure `.env.local` holds the real Supabase URL/anon key and `NEXT_PUBLIC_SITE_URL`, then run: `npm run build`
Expected: build succeeds; home, `/listings`, `/about`, and every `/listings/<slug>` are prerendered (static).

- [ ] **Step 5: Deploy to Netlify**

Connect the repo to Netlify (or `netlify deploy --build --prod`). In Netlify → Site settings → Environment variables, set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (the real domain once chosen), `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` (if ready; otherwise leave empty — maps stay in link-fallback mode).
Verify after deploy:
- Home, a listing detail, and `/about` load.
- `https://<site>/sitemap.xml` and `https://<site>/robots.txt` return 200.
- View-source on a listing shows `<script type="application/ld+json">` and OG tags.

- [ ] **Step 6: Submit to search engines**

Register the site + submit `sitemap.xml` in **네이버 서치어드바이저** and **구글 서치콘솔** (manual, one-time). Add the ownership-verification meta tag/file each console gives you (a `verification` entry in root `metadata` or a file in `public/`).

- [ ] **Step 7: Commit the release changes**

```bash
git add -A
git commit -m "chore: real office data, real seed, og image; P1 release-ready"
```

---

## Self-Review

**1. Spec coverage** (spec §4–§8 → task):
- 공통 헤더/푸터/전화 CTA/법정정보 → Task 6. ✔
- 홈(히어로·대표매물·비공개 배너·신뢰블록) → Task 8. ✔ (최근 리포트/정보글 block deferred to P3 — no `posts` yet.)
- 매물 목록(필터·카드·하단 CTA) → Tasks 7 + 9. ✔
- 매물 상세(슬라이더·핵심정보표·네이버지도·본문·공유·전화 CTA) → Tasks 10 + 11. ✔
- 회사소개 → Task 13. ✔
- 상담문의: phone modal → Task 6; **request form deferred to P2** (Global Constraints — phone-first). ✔
- SEO(SSG·메타·OG·JSON-LD·sitemap·robots·canonical) → Tasks 4, 6, 11, 12. ✔
- 데이터 모델(listings/posts/inquiries/admin) → Task 2. ✔
- 인프라(Next SSG + Supabase + Netlify) → Tasks 1, 14. ✔
- 법정 표시·광고 필드(카드·상세·푸터) → enforced by tests in Tasks 6, 7, 10. ✔
- **Deferred (correctly out of P1):** admin/매물등록, AI 설명, 온디맨드 ISR, 콘텐츠 허브/리포트 자동화, 뉴스 위젯, 문자/이메일 알림, 사진 최적화 → P2–P4. ✔

**2. Placeholder scan:** No "TBD/TODO/implement later" in engineering steps. The `< >` tokens in `site.ts`/`about` are **owner-supplied data**, gated for removal by Task 14 Step 1's grep. ✔

**3. Type consistency:** `Listing`/`ListingRow` fields, `rowToListing`, `applyFilters`, `getPublishedListings`/`getFeaturedListings`/`getListingBySlug`/`getAllListingSlugs`, `buildListingMetadata`/`buildOrgJsonLd`/`buildListingJsonLd`, `formatPrice`/`formatArea`/`pyeong`/`formatDealPrice`, `siteConfig`, `PhoneModalTrigger`, `ListingBrowser`, `ImageSlider`, `SpecTable`, `ShareButtons`, `NaverMap` — names are used identically across producing and consuming tasks. ✔

**Cross-task test isolation:** every task's tests depend only on modules delivered in that task or earlier (`seo.test.ts` uses a `Listing` literal, not Task 5's `rowToListing`; `ListingCard`/`ListingBrowser`/`SpecTable` tests use `rowToListing`+fixtures from Tasks 2/5 which precede them). Each task runs a clean red→green in isolation. ✔
