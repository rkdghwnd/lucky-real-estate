# Vite SPA Migration Plan (Next.js → Vite + React SPA)

**Goal:** Migrate the public site + admin off Next.js/OpenNext-Cloudflare to a
fully client-rendered (CSR) React SPA, built with Vite, hosted statically on
**S3 + CloudFront + Route53**. SEO is intentionally deprioritized (site is a
brochure; leads come from platforms/offline) — data is fetched live in the
browser, so **no rebuild-on-write pipeline is needed**; deploys happen on code
changes only.

Branch: `feat/vite-spa-migration`.

## Target stack

| Area | Choice | Why |
|---|---|---|
| Build | Vite + `@vitejs/plugin-react` → `dist/` | Static output for S3 |
| Router | React Router v7 (`createBrowserRouter`) | Native dynamic routes, SPA-fallback friendly |
| Data | TanStack Query | loading/error/cache; admin mutation→invalidate replaces `revalidatePath` |
| Styling | Tailwind v4 via `@tailwindcss/vite` | drop postcss config; globals.css unchanged |
| Fonts | `@fontsource/noto-sans-kr` (400/500/700) | self-host; keep `--font-noto-sans-kr` var |
| UI | antd v6 + `@ant-design/cssinjs` `StyleProvider layer` | keep `@layer antd`; drop `nextjs-registry` |
| Supabase | single browser client | public read + admin; RLS enforces admin writes |
| Head | base tags + brand JSON-LD in `index.html`; per-page `<title>` hook; static `robots.txt`/`manifest` | brand-level presence only |

## next/* replacement map

| import | files | replacement |
|---|---|---|
| `next/link` | 8 | React Router `Link` |
| `next/navigation` | 9 | `useNavigate`/`useLocation`/`useSearchParams`/`<Navigate>`/NotFound |
| `next/image` | 5 | `<img loading="lazy">` (thin wrapper) |
| `next/font/google` | 1 | `@fontsource/noto-sans-kr` |
| `next/headers` (cookies) | 1 | remove (browser session) |
| `next/cache` (revalidatePath) | 1 | remove (Query invalidation) |
| `next` types (Metadata…) | ~10 | remove / head hook / static files |

## env scheme: `process.env.NEXT_PUBLIC_X` → `import.meta.env.VITE_X`

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SITE_URL` (real domain), `NAVER_MAP_CLIENT_ID`,
`NAVER_SITE_VERIFICATION`, `GOOGLE_SITE_VERIFICATION`. Remove dead `process.env.URL`.

## Target structure (src/)

```
main.tsx            entry: createRoot + providers + RouterProvider
App.tsx             route tree (createBrowserRouter)
routes/             Home, Listings, ListingDetail, About, NotFound,
                    admin/{AdminLayout(RequireAdmin), Login, Dashboard, ListingNew, ListingEdit}
components/         mostly unchanged (19 already 'use client')
lib/                mostly unchanged; env + supabase updated
  supabase.ts       single browser client
  queries/          TanStack Query hooks
```

## Execution checklist (Phase 2)

- [ ] **2a** Scaffold Vite: `index.html`, `src/main.tsx`, `vite.config.ts` (react + tailwind + tsconfig paths), tsconfig (drop `next` plugin/includes, add `vite/client`), package scripts. Boot check.
- [ ] **2b** Providers & globals: AntdProvider + `StyleProvider layer` + TanStack Query + RouterProvider; import `globals.css` + fonts; keep `--font-noto-sans-kr`.
- [ ] **2c** Routing shell: root layout → App layout (Header/Footer/SiteChrome); route tree (`/`, `/listings`, `/listings/:slug`, `/about`, `/admin/*`, `*`→NotFound).
- [ ] **2d** env + Supabase: `VITE_*` everywhere; single browser client; delete `supabase/server.ts`.
- [ ] **2e** Data hooks: TanStack Query `useListings`/`useListing`/`useFeatured`; public pages → client + hooks (loading/empty/error states).
- [ ] **2f** Swap next/*: Link, Image, navigation across all files.
- [ ] **2g** Admin CSR rebuild: `RequireAdmin` guard, login, dashboard, new, edit (`:id` native), mutations → Query invalidate; delete `revalidate.ts`.
- [ ] **2h** Head/SEO: index.html base tags + Org/Website JSON-LD; per-page title hook; static `public/robots.txt`, `public/manifest.webmanifest` (+ optional sitemap).
- [ ] **2i** Remove Next/OpenNext: deps (`next`, `@opennextjs/cloudflare`, `wrangler`, `@ant-design/nextjs-registry`), `next.config.mjs`, `.open-next/`, `wrangler.jsonc`, `open-next.config.ts`, `postcss.config.mjs`, package scripts.
- [ ] **2j** Tests + verify: router wrappers, `import.meta.env`; delete/rewrite Next-route tests (generateStaticParams, robots, sitemap, revalidate, actions); `vite build` → `dist` preview; vitest green; drive the app.

## Watch items
- antd v6 + React 19: ConfigProvider tokens; ensure SSR extraction removed but `@layer antd` preserved via `StyleProvider layer`.
- Tailwind v4 content detection via `@tailwindcss/vite`.
- NaverMap SDK (client, `VITE_NAVER_MAP_CLIENT_ID`).
- Image optimization lost (accepted) — Supabase public URLs direct.
- SPA routing → CloudFront fallback (404→index.html) handled in Phase 3.

## After Phase 2
- **Phase 3** deploy automation: IaC (S3 + CloudFront + OAC + SPA fallback + ACM us-east-1 + Route53) + GitHub Actions (build → `s3 sync` → CF invalidation), env via Actions secrets. No rebuild trigger.
- **Phase 4** apply `frontend-fundamentals` skill refactor, module by module.
