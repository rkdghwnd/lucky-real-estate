# Listing Admin Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task, then superpowers:compound-engineering after review. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 현재 Next.js 사이트의 `/admin`에 고정 Supabase 계정 한 개로 로그인해 매물을 등록·수정·거래완료·재공개하고 사진과 공개 페이지 캐시를 안전하게 관리하는 기능을 만든다.

**Architecture:** `@supabase/ssr` 쿠키 세션과 `admin_users` 단일 행 허용 목록을 사용하고, Postgres/Storage RLS를 최종 권한 경계로 둔다. 관리자 UI는 별도 chrome을 사용하며, 브라우저가 최적화한 사진을 Storage에 먼저 올린 뒤 Server Action이 매물을 저장하고 홈·목록·상세·사이트맵을 재검증한다.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Auth/Postgres/Storage, `@supabase/ssr`, Zod, `browser-image-compression`, Tailwind CSS 4, Vitest, Testing Library

---

**Approved operating rules:** 고정 계정 한 개, 신규 가입 차단, 아이디·비밀번호 로그인, 비밀번호 재설정, 저장 즉시 공개, 거래완료·다시 공개, 명시적 로그아웃, Netlify 배포를 기준으로 한다.

## File map

### Database and project setup

- Create `supabase/migrations/20260706010000_admin_listing_management.sql`: singleton admin table, helper function, listing/status/Storage RLS, updated-at trigger, public image bucket.
- Modify `supabase/schema.sql`: fresh-project schema matches the migration result.
- Create `src/lib/admin/admin-schema.test.ts`: static migration contract checks that run without a local Supabase daemon.
- Modify `docs/SETUP.md`: admin account, UID, bucket, redirect URL, deployment verification runbook.
- Modify `.env.local.example`: clarify that the public key is used with RLS and no service key is required.

### Shared domain and Supabase infrastructure

- Create `src/lib/admin/listing-schema.ts`: Zod schemas, form-to-payload conversion, price-unit conversion, field errors.
- Create `src/lib/admin/listing-schema.test.ts`: conditional sale/rent and field validation.
- Create `src/lib/admin/slug.ts` and `slug.test.ts`: stable new-listing slug generation.
- Create `src/lib/listing-images.ts` and `listing-images.test.ts`: legacy URL/new Storage path resolution.
- Modify `src/lib/listings.ts`: resolve image paths while mapping rows.
- Create `src/lib/supabase/client.ts`: browser client.
- Create `src/lib/supabase/server.ts`: cookie-aware server client.
- Create `src/lib/supabase/proxy.ts`: Auth token refresh.
- Create `src/proxy.ts`: `/admin` matcher.
- Create `src/lib/admin/auth.ts` and `auth.test.ts`: claims plus `is_admin()` verification.

### Admin data and mutations

- Create `src/lib/admin/listings.ts` and `listings.test.ts`: admin SELECT/INSERT/UPDATE/status repository functions.
- Create `src/lib/admin/revalidate.ts` and `revalidate.test.ts`: public path invalidation.
- Create `src/app/admin/actions.ts` and `actions.test.ts`: login, password reset, CRUD and status actions.

### Layout and screens

- Create `src/components/layout/SiteChrome.tsx` and `SiteChrome.test.tsx`: suppress public Header/Footer for `/admin`.
- Modify `src/app/layout.tsx`: pass public chrome through `SiteChrome`.
- Create `src/app/admin/layout.tsx`: admin metadata and base surface.
- Create `src/app/admin/(protected)/layout.tsx`: verified-admin guard and admin header.
- Create `src/components/admin/AdminHeader.tsx`.
- Create `src/components/admin/LoginForm.tsx` and `LoginForm.test.tsx`.
- Create login/recovery routes under `src/app/admin/(auth)` and callback route under `src/app/admin/auth/callback/route.ts`.
- Create `src/components/admin/AdminListingTable.tsx` and test: search, status tabs, status confirmation.
- Create `src/app/admin/(protected)/page.tsx`: server-loaded admin dashboard.

### Listing form and images

- Create `src/lib/admin/images.ts` and `images.test.ts`: file validation, compression, upload, cleanup.
- Create `src/components/admin/ImageUploader.tsx` and `ImageUploader.test.tsx`: select, reorder, representative image, remove, status display.
- Create `src/components/admin/ListingForm.tsx` and `ListingForm.test.tsx`: grouped form, live price/area preview, submit pipeline, error focus.
- Create new/edit pages under `src/app/admin/(protected)/listings`.

### Public cache compatibility

- Modify `src/app/listings/[slug]/page.tsx`: allow runtime slug rendering.
- Modify `src/app/listings/[slug]/generateStaticParams.test.ts`: assert runtime params remain enabled.
- Modify `src/app/sitemap.ts` only if verification shows route revalidation needs an explicit `revalidate` export.

---

### Task 1: Install pinned runtime dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install packages in the isolated worktree**

Run:

```powershell
npm.cmd install @supabase/ssr zod browser-image-compression
```

Expected: exit 0 and the three packages appear in `dependencies`.

- [ ] **Step 2: Verify dependency resolution**

Run:

```powershell
npm.cmd ls @supabase/ssr zod browser-image-compression
```

Expected: exit 0 with one installed version for each package.

- [ ] **Step 3: Commit**

```powershell
git add package.json package-lock.json
git commit -m "build: add admin auth and image dependencies"
```

### Task 2: Add the Supabase admin schema and RLS contract

**Files:**
- Create: `src/lib/admin/admin-schema.test.ts`
- Create: `supabase/migrations/20260706010000_admin_listing_management.sql`
- Modify: `supabase/schema.sql`

- [ ] **Step 1: Write the failing migration contract test**

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('supabase/migrations/20260706010000_admin_listing_management.sql', 'utf8');

describe('admin listing migration', () => {
  it('enforces one admin and does not grant listing delete', () => {
    expect(migration).toContain('singleton boolean primary key');
    expect(migration).toContain('create or replace function public.is_admin()');
    expect(migration).toContain('create policy "admin inserts listings"');
    expect(migration).toContain('create policy "admin updates listings"');
    expect(migration).not.toContain('create policy "admin deletes listings"');
  });

  it('protects the listing image bucket', () => {
    expect(migration).toContain("'listing-images'");
    expect(migration).toContain('on storage.objects for insert');
    expect(migration).toContain('on storage.objects for delete');
    expect(migration).toContain('(select public.is_admin())');
  });

  it('updates timestamps and limits statuses', () => {
    expect(migration).toContain("status in ('공개','거래완료')");
    expect(migration).toContain('set_updated_at');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm.cmd test -- src/lib/admin/admin-schema.test.ts`

Expected: FAIL because the migration file does not exist.

- [ ] **Step 3: Implement the migration**

The migration must contain these executable statements:

```sql
create table if not exists public.admin_users (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

update public.listings set status = '거래완료' where status = '비공개';
alter table public.listings drop constraint if exists listings_status_check;
alter table public.listings add constraint listings_status_check check (status in ('공개','거래완료'));

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at before update on public.listings
for each row execute function public.set_updated_at();
```

Add explicit `anon` public-read and `authenticated` admin SELECT/INSERT/UPDATE policies, revoke authenticated DELETE, create the public `listing-images` bucket with WebP/JPEG/PNG MIME types and a 5MB file limit, and create authenticated INSERT/UPDATE/DELETE policies on `storage.objects` restricted by `public.is_admin()` and bucket ID.

Update `supabase/schema.sql` to produce the same final schema on a fresh project. Remove the legacy `admin(pin_hash)` table from the fresh schema; the migration must abort if that legacy table contains data before dropping it.

- [ ] **Step 4: Run migration contract test and full tests**

Run:

```powershell
npm.cmd test -- src/lib/admin/admin-schema.test.ts
npm.cmd test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add supabase/schema.sql supabase/migrations/20260706010000_admin_listing_management.sql src/lib/admin/admin-schema.test.ts
git commit -m "feat: secure listing administration with RLS"
```

### Task 3: Build listing validation and identifiers

**Files:**
- Create: `src/lib/admin/listing-schema.test.ts`
- Create: `src/lib/admin/listing-schema.ts`
- Create: `src/lib/admin/slug.test.ts`
- Create: `src/lib/admin/slug.ts`

- [ ] **Step 1: Write failing listing-schema tests**

Tests must exercise this public API:

```ts
import { describe, expect, it } from 'vitest';
import { parseListingForm, listingPayloadSchema, manwonToWon } from './listing-schema';

describe('listing admin schema', () => {
  it('converts sale price from 만원 to 원', () => {
    expect(manwonToWon('185000')).toBe(1_850_000_000);
  });

  it('requires monthly rent for 임대', () => {
    const result = listingPayloadSchema.safeParse({
      id: crypto.randomUUID(), title: '검단 창고 임대', propertyType: '창고', dealType: '임대',
      address: '인천 서구 왕길동 1', price: 300_000_000, monthlyRent: null,
      landAreaM2: 1000, buildingAreaM2: 500, zoning: null, landCategory: null,
      roadAccess: null, ceilingHeightM: null, powerCapacity: null, completionYear: null,
      lat: null, lng: null, images: ['id/image.webp'], description: null,
    });
    expect(result.success).toBe(false);
  });

  it('parses a complete sale form', () => {
    const form = new FormData();
    form.set('title', '오류동 제조공장');
    form.set('propertyType', '공장');
    form.set('dealType', '매매');
    form.set('address', '인천 서구 오류동 1');
    form.set('priceManwon', '185000');
    form.set('landAreaM2', '1653');
    expect(parseListingForm(form).success).toBe(true);
  });
});
```

- [ ] **Step 2: Verify RED**

Run: `npm.cmd test -- src/lib/admin/listing-schema.test.ts`

Expected: FAIL because `listing-schema.ts` does not exist.

- [ ] **Step 3: Implement the schemas**

Export these types and functions:

```ts
export type ListingPayload = z.infer<typeof listingPayloadSchema>;
export type ListingFormParseResult =
  | { success: true; data: Omit<ListingPayload, 'id' | 'images'> }
  | { success: false; fieldErrors: Record<string, string> };

export function manwonToWon(value: FormDataEntryValue | null): number;
export function wonToManwon(value: number | null): string;
export function parseListingForm(form: FormData): ListingFormParseResult;
```

`listingPayloadSchema` must whitelist all writable listing fields, reject unknown fields with `.strict()`, require one to twenty image strings, require sale price > 0, require rent deposit >= 0 and monthly rent > 0, and apply the bounds from the approved design. Optional numeric blanks become `null`.

- [ ] **Step 4: Write failing slug tests**

```ts
import { expect, it } from 'vitest';
import { makeListingSlug } from './slug';

it('creates a stable date and UUID based slug', () => {
  expect(makeListingSlug('123e4567-e89b-12d3-a456-426614174000', new Date('2026-07-06T00:00:00Z')))
    .toBe('listing-20260706-123e45');
});
```

- [ ] **Step 5: Verify RED, implement, and verify GREEN**

Implement:

```ts
export function makeListingSlug(id: string, now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = id.replaceAll('-', '').slice(0, 6).toLowerCase();
  return `listing-${date}-${suffix}`;
}
```

Run: `npm.cmd test -- src/lib/admin/listing-schema.test.ts src/lib/admin/slug.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/lib/admin/listing-schema.ts src/lib/admin/listing-schema.test.ts src/lib/admin/slug.ts src/lib/admin/slug.test.ts
git commit -m "feat: validate admin listing input"
```

### Task 4: Resolve Storage image paths in public listings

**Files:**
- Create: `src/lib/listing-images.test.ts`
- Create: `src/lib/listing-images.ts`
- Modify: `src/lib/listings.ts`
- Modify: `src/lib/listings.test.ts`

- [ ] **Step 1: Write RED tests**

```ts
import { describe, expect, it } from 'vitest';
import { resolveListingImage } from './listing-images';

describe('resolveListingImage', () => {
  it('keeps legacy absolute URLs', () => {
    expect(resolveListingImage('https://legacy.example/a.jpg', 'https://x.supabase.co')).toBe('https://legacy.example/a.jpg');
  });

  it('resolves a Storage object path', () => {
    expect(resolveListingImage('listing-id/a.webp', 'https://x.supabase.co'))
      .toBe('https://x.supabase.co/storage/v1/object/public/listing-images/listing-id/a.webp');
  });
});
```

Extend `rowToListing` test to expect a Storage path to become a public URL when a Supabase base URL is passed.

- [ ] **Step 2: Verify RED**

Run: `npm.cmd test -- src/lib/listing-images.test.ts src/lib/listings.test.ts`

Expected: FAIL because the resolver and mapping parameter do not exist.

- [ ] **Step 3: Implement and use the resolver**

```ts
export function resolveListingImage(pathOrUrl: string, supabaseUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = supabaseUrl.replace(/\/$/, '');
  const path = pathOrUrl.split('/').map(encodeURIComponent).join('/');
  return `${base}/storage/v1/object/public/listing-images/${path}`;
}
```

Change `rowToListing(row, supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')` to map non-empty image values through the resolver. Tests supply the URL explicitly; production uses the configured URL.

- [ ] **Step 4: Verify GREEN and commit**

Run: `npm.cmd test -- src/lib/listing-images.test.ts src/lib/listings.test.ts`

```powershell
git add src/lib/listing-images.ts src/lib/listing-images.test.ts src/lib/listings.ts src/lib/listings.test.ts
git commit -m "feat: resolve managed listing images"
```

### Task 5: Add cookie-aware Supabase clients and the admin guard

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/proxy.ts`
- Create: `src/proxy.ts`
- Create: `src/lib/admin/auth.test.ts`
- Create: `src/lib/admin/auth.ts`

- [ ] **Step 1: Write the RED admin access tests**

Use a small fake client that exposes `auth.getClaims()` and `rpc('is_admin')`:

```ts
import { describe, expect, it } from 'vitest';
import { getAdminAccess } from './auth';

it('returns the verified admin identity', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'u1', email: 'admin@example.com' } }, error: null }) },
    rpc: async () => ({ data: true, error: null }),
  };
  await expect(getAdminAccess(client as never)).resolves.toEqual({ userId: 'u1', email: 'admin@example.com' });
});

it('rejects a valid user outside the allowlist', async () => {
  const client = {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'u2', email: 'other@example.com' } }, error: null }) },
    rpc: async () => ({ data: false, error: null }),
  };
  await expect(getAdminAccess(client as never)).resolves.toBeNull();
});
```

- [ ] **Step 2: Verify RED**

Run: `npm.cmd test -- src/lib/admin/auth.test.ts`

Expected: FAIL because `auth.ts` does not exist.

- [ ] **Step 3: Implement clients and guard**

`client.ts` uses `createBrowserClient(url, key)`. `server.ts` uses `createServerClient` and `cookies()` with `getAll`/`setAll`; cookie writes catch Server Component write errors. `proxy.ts` uses `request.cookies.getAll()`, copies refreshed cookies to the response, and calls `supabase.auth.getClaims()` without trusting `getSession()`.

`getAdminAccess(client)` must:

```ts
export interface AdminAccess { userId: string; email: string }

export async function getAdminAccess(client: SupabaseClient): Promise<AdminAccess | null> {
  const { data, error } = await client.auth.getClaims();
  const sub = data?.claims?.sub;
  if (error || typeof sub !== 'string') return null;
  const { data: allowed, error: adminError } = await client.rpc('is_admin');
  if (adminError || allowed !== true) return null;
  return { userId: sub, email: typeof data.claims.email === 'string' ? data.claims.email : '' };
}
```

`src/proxy.ts` exports `proxy(request)` and a matcher for `/admin/:path*`.

- [ ] **Step 4: Verify and commit**

Run:

```powershell
npm.cmd test -- src/lib/admin/auth.test.ts
npx.cmd tsc --noEmit
```

```powershell
git add src/lib/supabase src/lib/admin/auth.ts src/lib/admin/auth.test.ts src/proxy.ts
git commit -m "feat: add Supabase SSR admin sessions"
```

### Task 6: Add admin repository, actions, and cache revalidation

**Files:**
- Create: `src/lib/admin/listings.test.ts`
- Create: `src/lib/admin/listings.ts`
- Create: `src/lib/admin/revalidate.test.ts`
- Create: `src/lib/admin/revalidate.ts`
- Create: `src/app/admin/actions.test.ts`
- Create: `src/app/admin/actions.ts`

- [ ] **Step 1: Write RED repository tests**

Test the exact snake-case payload produced from a `ListingPayload`, that admin listings order by `updated_at desc`, and that status updates only accept `공개 | 거래완료`. Use injected fake Supabase builders; do not mock the mapping functions.

Required exports:

```ts
export interface AdminListing extends Listing { imagePaths: string[] }
export async function getAdminListings(client: SupabaseClient): Promise<AdminListing[]>;
export async function getAdminListingById(client: SupabaseClient, id: string): Promise<AdminListing | null>;
export async function createAdminListing(client: SupabaseClient, input: ListingPayload): Promise<AdminListing>;
export async function updateAdminListing(client: SupabaseClient, id: string, input: ListingPayload): Promise<AdminListing>;
export async function setAdminListingStatus(client: SupabaseClient, id: string, status: '공개' | '거래완료'): Promise<{ slug: string }>;
```

`AdminListing.images`에는 화면 표시용으로 해석된 public URL을, `AdminListing.imagePaths`에는 DB의 원본 `images` 배열을 넣는다. 편집 폼은 `imagePaths`로 순서 변경과 Storage 삭제를 수행한다.

- [ ] **Step 2: Verify RED, implement repository, verify GREEN**

Run: `npm.cmd test -- src/lib/admin/listings.test.ts`

Expected first run: FAIL missing module. Expected after implementation: PASS.

- [ ] **Step 3: Write RED cache tests**

Mock `next/cache` and assert `revalidateListingPaths(slug)` calls:

```ts
expect(revalidatePath).toHaveBeenCalledWith('/');
expect(revalidatePath).toHaveBeenCalledWith('/listings');
expect(revalidatePath).toHaveBeenCalledWith(`/listings/${slug}`);
expect(revalidatePath).toHaveBeenCalledWith('/sitemap.xml');
```

- [ ] **Step 4: Implement the cache helper and actions**

All action results use:

```ts
export type AdminActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; code: 'VALIDATION' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'STORAGE' | 'DATABASE'; message: string; fieldErrors?: Record<string, string> };
```

CRUD actions create one cookie-aware server client, call `getAdminAccess(client)`, parse with `listingPayloadSchema`, call the repository, revalidate successful changes, and never return raw Supabase errors. `loginAction` uses `signInWithPassword`, then `getAdminAccess`; an unlisted authenticated user is signed out. Password reset actions use Supabase Auth redirect URLs derived from `NEXT_PUBLIC_SITE_URL`.

- [ ] **Step 5: Verify actions and commit**

Run:

```powershell
npm.cmd test -- src/lib/admin/listings.test.ts src/lib/admin/revalidate.test.ts src/app/admin/actions.test.ts
npx.cmd tsc --noEmit
```

```powershell
git add src/lib/admin/listings.ts src/lib/admin/listings.test.ts src/lib/admin/revalidate.ts src/lib/admin/revalidate.test.ts src/app/admin/actions.ts src/app/admin/actions.test.ts
git commit -m "feat: add protected listing mutations"
```

### Task 7: Separate public and admin chrome and enable runtime slugs

**Files:**
- Create: `src/components/layout/SiteChrome.test.tsx`
- Create: `src/components/layout/SiteChrome.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/listings/[slug]/page.tsx`
- Modify: `src/app/listings/[slug]/generateStaticParams.test.ts`

- [ ] **Step 1: Write RED SiteChrome tests**

Mock `next/navigation` `usePathname` and assert public paths render passed header/main/footer while `/admin` renders only children.

```tsx
render(<SiteChrome header={<header>public</header>} footer={<footer>footer</footer>}><p>page</p></SiteChrome>);
expect(screen.queryByText('public')).not.toBeInTheDocument();
expect(screen.getByText('page')).toBeInTheDocument();
```

- [ ] **Step 2: Verify RED, implement, and verify GREEN**

`SiteChrome` is a client component with the public contract:

```tsx
export function SiteChrome({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return <>{children}</>;
  return <>{header}<main>{children}</main>{footer}</>;
}
```

Root layout passes `<Header />`, `<Footer />`, and `children`; it no longer hardcodes the public `<main>` itself.

- [ ] **Step 3: Write RED runtime slug assertion**

Extend the detail route test to import `dynamicParams` and assert it is `true`.

- [ ] **Step 4: Remove the runtime slug block and verify**

Keep `dynamic = 'force-static'` and `generateStaticParams()`, and change the route export to `export const dynamicParams = true`.

Run:

```powershell
npm.cmd test -- src/components/layout/SiteChrome.test.tsx src/app/listings/[slug]/generateStaticParams.test.ts
npx.cmd tsc --noEmit
```

- [ ] **Step 5: Commit**

```powershell
git add src/components/layout/SiteChrome.tsx src/components/layout/SiteChrome.test.tsx src/app/layout.tsx src/app/listings/[slug]/page.tsx src/app/listings/[slug]/generateStaticParams.test.ts
git commit -m "feat: add isolated admin shell and runtime listings"
```

### Task 8: Implement login, recovery, and protected admin layout

**Files:**
- Create: `src/components/admin/LoginForm.test.tsx`
- Create: `src/components/admin/LoginForm.tsx`
- Create: `src/components/admin/PasswordRecoveryForm.tsx`
- Create: `src/components/admin/PasswordResetForm.tsx`
- Create: `src/components/admin/AdminHeader.tsx`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/(auth)/login/page.tsx`
- Create: `src/app/admin/(auth)/forgot-password/page.tsx`
- Create: `src/app/admin/(auth)/reset-password/page.tsx`
- Create: `src/app/admin/auth/callback/route.ts`
- Create: `src/app/admin/(protected)/layout.tsx`

- [ ] **Step 1: Write RED login form tests**

Tests inject an action function and cover email/password submission, disabled pending state, generic error, and successful `router.replace('/admin')`.

- [ ] **Step 2: Verify RED and implement the auth screens**

Use the approved centered card. The login page contains no signup link. Recovery asks only for the fixed account email. Reset asks twice for a password of at least 10 characters. Callback exchanges the `code` with `exchangeCodeForSession` and only permits a relative `next` path beginning with `/admin`.

- [ ] **Step 3: Implement protected layout**

The protected layout creates the server client, calls `getAdminAccess`, redirects to `/admin/login` if null, and otherwise renders `AdminHeader` plus children. `AdminHeader` shows site link, verified email, and logout.

- [ ] **Step 4: Verify and commit**

Run:

```powershell
npm.cmd test -- src/components/admin/LoginForm.test.tsx
npx.cmd tsc --noEmit
```

```powershell
git add src/components/admin src/app/admin
git commit -m "feat: add fixed-account admin login"
```

### Task 9: Implement the admin listing dashboard

**Files:**
- Create: `src/components/admin/AdminListingTable.test.tsx`
- Create: `src/components/admin/AdminListingTable.tsx`
- Create: `src/app/admin/(protected)/page.tsx`

- [ ] **Step 1: Write RED dashboard tests**

Render public and completed fixtures. Assert counts, title/address search, public/completed tabs, edit links, status confirmation copy, successful status action, and failed action message.

- [ ] **Step 2: Verify RED**

Run: `npm.cmd test -- src/components/admin/AdminListingTable.test.tsx`

Expected: FAIL missing component.

- [ ] **Step 3: Implement dashboard**

The server page calls `getAdminListings`. The client table uses the approved desktop-first columns, `updatedAt` descending input order, search by normalized title/address, and existing `Dialog` for status confirmation. A completed row offers `다시 공개`; a public row offers `거래완료`. Successful actions call `router.refresh()`.

- [ ] **Step 4: Verify and commit**

Run:

```powershell
npm.cmd test -- src/components/admin/AdminListingTable.test.tsx
npx.cmd tsc --noEmit
```

```powershell
git add src/components/admin/AdminListingTable.tsx src/components/admin/AdminListingTable.test.tsx 'src/app/admin/(protected)/page.tsx'
git commit -m "feat: add admin listing dashboard"
```

### Task 10: Build and test the image pipeline

**Files:**
- Create: `src/lib/admin/images.test.ts`
- Create: `src/lib/admin/images.ts`
- Create: `src/components/admin/ImageUploader.test.tsx`
- Create: `src/components/admin/ImageUploader.tsx`

- [ ] **Step 1: Write RED image helper tests**

Cover accepted MIME types, 20MB source limit, generated WebP filename, max-three upload scheduling, returned object paths in display order, and best-effort cleanup.

Public API:

```ts
export interface PendingListingImage { id: string; file: File; previewUrl: string }
export interface StoredListingImage { id: string; path: string; previewUrl: string }
export type ListingImageItem = PendingListingImage | StoredListingImage;

export function validateImageFiles(files: File[], currentCount: number): string | null;
export async function optimizeListingImage(file: File): Promise<File>;
export async function uploadPendingImages(
  client: SupabaseClient,
  listingId: string,
  items: ListingImageItem[],
  onStatus: (id: string, status: 'uploading' | 'done' | 'failed') => void,
): Promise<{ paths: string[]; uploadedPaths: string[] }>;
export async function cleanupListingImages(client: SupabaseClient, paths: string[]): Promise<void>;
```

- [ ] **Step 2: Verify RED, implement helpers, verify GREEN**

Use `browser-image-compression` with `maxSizeMB: 5`, `maxWidthOrHeight: 2000`, `fileType: 'image/webp'`, `initialQuality: 0.82`, `useWebWorker: true`. Upload random `.webp` names into `${listingId}/...`; do not use upsert.

- [ ] **Step 3: Write RED uploader tests**

Test file selection, over-limit message, representative label on first item, move-left/move-right controls, remove, and accessible file input.

- [ ] **Step 4: Implement uploader and verify**

`ImageUploader` is controlled: `items`, `onChange`, and `errors` props. Existing images use resolved preview URLs and stored paths; pending files use object URLs. Revoke object URLs on removal/unmount.

Run:

```powershell
npm.cmd test -- src/lib/admin/images.test.ts src/components/admin/ImageUploader.test.tsx
npx.cmd tsc --noEmit
```

- [ ] **Step 5: Commit**

```powershell
git add src/lib/admin/images.ts src/lib/admin/images.test.ts src/components/admin/ImageUploader.tsx src/components/admin/ImageUploader.test.tsx
git commit -m "feat: add managed listing image uploads"
```

### Task 11: Implement the one-page listing form and routes

**Files:**
- Create: `src/components/admin/ListingForm.test.tsx`
- Create: `src/components/admin/ListingForm.tsx`
- Create: `src/app/admin/(protected)/listings/new/page.tsx`
- Create: `src/app/admin/(protected)/listings/[id]/edit/page.tsx`
- Modify: `src/components/map/NaverMap.test.tsx`
- Modify: `src/components/map/NaverMap.tsx`

- [ ] **Step 1: Write RED form tests**

Cover:

```text
- sale fields show 매매가(만원), hide 월세, and show formatted won preview
- rent fields show 보증금/월세 and reject blank monthly rent
- m² input shows approximate 평
- missing title/address/photo focuses and labels the first invalid section
- create submits optimized paths then invokes createListingAction
- create failure cleans newly uploaded paths and keeps form values
- edit submits final image order and removes deleted stored paths only after DB success
- pending submit disables both cancel and save controls
```

- [ ] **Step 2: Verify RED**

Run: `npm.cmd test -- src/components/admin/ListingForm.test.tsx`

Expected: FAIL missing component.

- [ ] **Step 3: Implement the grouped form**

First extend `NaverMap` with an optional `onResolved?: (position: { lat: number; lng: number }) => void` prop. Add a failing test that invokes the mocked geocoder callback and expects `{ lat, lng }`, then call the prop from `createMap` after validating numeric coordinates. Existing public callers remain unchanged.

Use native labeled inputs and a controlled image list. Keep `listingId` stable for the component lifetime with the existing ID on edit or `crypto.randomUUID()` on create. On submit:

```ts
const parsed = parseListingForm(new FormData(form));
if (!parsed.success) {
  setFieldErrors(parsed.fieldErrors);
  focusFirstError(parsed.fieldErrors);
  return;
}
const upload = await uploadPendingImages(client, listingId, images, setImageStatus);
const payload = listingPayloadSchema.parse({ id: listingId, ...parsed.data, images: upload.paths });
const result = mode === 'create'
  ? await createListingAction(payload)
  : await updateListingAction(listingId, payload);
if (!result.ok) {
  await cleanupListingImages(client, upload.uploadedPaths);
  setSubmitError(result.message);
  return;
}
if (mode === 'edit') await cleanupListingImages(client, removedStoredPaths);
router.replace(`/admin?${mode === 'create' ? 'created' : 'updated'}=1`);
router.refresh();
```

The visual sections and sticky save bar follow the approved wireframe. After a valid address is entered, render the existing `NaverMap` preview and store resolved coordinates in hidden form state through `onResolved`. Coordinates remain optional: map/geocoding failure must not block address-based saving.

- [ ] **Step 4: Add server pages**

The new page renders an empty form. The edit page loads by UUID with `getAdminListingById` and calls `notFound()` when absent. Convert won to 만원 strings for initial values and preserve image object paths separately from resolved preview URLs.

- [ ] **Step 5: Verify and commit**

Run:

```powershell
npm.cmd test -- src/components/admin/ListingForm.test.tsx src/components/map/NaverMap.test.tsx
npx.cmd tsc --noEmit
```

```powershell
git add src/components/admin/ListingForm.tsx src/components/admin/ListingForm.test.tsx 'src/app/admin/(protected)/listings' src/components/map/NaverMap.tsx src/components/map/NaverMap.test.tsx
git commit -m "feat: add listing create and edit workflow"
```

### Task 12: Update the operator runbook

**Files:**
- Modify: `docs/SETUP.md`
- Modify: `.env.local.example`

- [ ] **Step 1: Add exact setup instructions**

Document:

```sql
insert into public.admin_users (singleton, user_id)
values (true, 'AUTH-USER-UUID')
on conflict (singleton) do update set user_id = excluded.user_id;
```

Include Dashboard steps to create one email user, disable new and anonymous signups, configure local/Preview/production redirect URLs, run the migration, verify the bucket, and perform create/edit/complete/restore smoke tests. State explicitly that no Service Role environment variable is used.

- [ ] **Step 2: Check the runbook and commit**

Run:

```powershell
rg -n "admin_users|Allow new users|Redirect URL|Service Role|거래완료|다시 공개" docs/SETUP.md .env.local.example
git diff --check
```

```powershell
git add docs/SETUP.md .env.local.example
git commit -m "docs: add listing admin operations runbook"
```

### Task 13: Full verification and browser acceptance

**Files:**
- Modify only files required by failing verification, with a RED regression test before each behavior fix.

- [ ] **Step 1: Run automated verification**

```powershell
npm.cmd test
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

Expected: all exit 0 with no test failures, lint errors, type errors, or build errors.

- [ ] **Step 2: Run local browser checks**

Start `npm.cmd run dev`, then verify at desktop width:

```text
/                         public header/footer present
/listings                 published listings render
/listings/<new-runtime>   route supports runtime params rather than build-only params
/admin                    unauthenticated request reaches login
/admin/login              no signup link; email/password form visible
/admin/forgot-password    fixed-account reset form visible
```

With configured Supabase admin credentials, verify login, create with photo, public detail, edit, transaction complete, restore, and logout. If production Supabase credentials are not available locally, run the UI/auth-redirect checks with the current project and record the credential-dependent acceptance steps as deployment-required rather than claiming them passed.

- [ ] **Step 3: Capture screenshots**

Save desktop screenshots for login, dashboard, new listing form, and one mobile compatibility viewport under `.superpowers/captures/admin-implementation/`.

- [ ] **Step 4: Review diff and commit fixes**

```powershell
git diff --check
git status --short
git log --oneline --decorate -12
```

Commit any verified regression fixes separately with a focused message.

### Task 14: Review, compound learning, and finish the branch

**Files:**
- Modify only if review finds an actionable issue or compound-engineering identifies a reusable repository instruction.

- [ ] **Step 1: Use `superpowers:requesting-code-review`**

Review the complete branch against `docs/superpowers/specs/2026-07-06-admin-listing-management-design.md`, prioritizing auth bypass, RLS mismatch, Storage orphaning, cache invalidation, and form data loss.

- [ ] **Step 2: Resolve findings with TDD**

For every behavioral finding, add a failing regression test, verify RED, implement the fix, and verify GREEN.

- [ ] **Step 3: Use `superpowers:compound-engineering`**

Capture only reusable lessons that will prevent recurrence in this repository.

- [ ] **Step 4: Use `superpowers:finishing-a-development-branch`**

Re-run the full verification suite, summarize the branch, and present integration options without merging into `main` while the user's existing working-tree edits are uncommitted.
