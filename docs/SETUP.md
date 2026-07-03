# 행운부동산 사이트 — 세팅 & 배포 가이드 (P1 공개 사이트)

개발자용 런북. 로컬 실행 → Supabase 연결 → 실데이터 채우기 → Netlify 배포 → 검색등록 순서.

## 0. 요구사항
- **Node 20+** (로컬은 최신 버전도 OK), **npm**
- 계정: **Supabase**(무료), **Netlify**(무료), (선택) **네이버 클라우드 플랫폼**(지도 API), 도메인 등록업체

## 1. 로컬 실행
```bash
npm install
cp .env.local.example .env.local     # 값은 2번에서 채움
npm run dev        # http://localhost:3000
npm test           # 전체 테스트 (37개)
npm run build      # 프로덕션 빌드 — Supabase 값 필요
```
> 홈/매물 페이지는 Supabase에서 데이터를 읽으므로 `.env.local`의 Supabase 값이 없으면 빌드/실행이 **의도적으로 실패**합니다(설정 누락을 조용히 넘기지 않기 위함). 회사소개(`/about`)는 DB 없이도 동작합니다.

## 2. Supabase 설정
1. supabase.com → **New project** 생성.
2. **SQL Editor** → `supabase/schema.sql` 붙여넣고 **Run** → 이어서 `supabase/seed.sql` **Run**.
3. 확인: `select count(*) from listings where status='공개';` → **6**.
4. **Settings → API** 에서 복사해 `.env.local`에 입력:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon public key
5. `NEXT_PUBLIC_SITE_URL` = 배포 도메인(정해지기 전엔 임시 https URL도 가능).

> anon 키는 공개돼도 안전합니다 — RLS 정책상 `상태='공개'` 매물만 **읽기 전용**으로 노출됩니다.

## 3. 실데이터 채우기 (배포 전 필수)
- **`src/lib/site.ts`**의 `< >` 자리표시자를 실제 값으로: 상호 · 대표자명 · **중개등록번호** · 전화 · `phoneHref`(숫자만, 예 `tel:0320000000`) · 주소 · 영업시간.
  - 확인: `grep -rn "<[가-힣].*>" src/lib/site.ts` → 아무것도 안 나와야 함.
- **사진**: Supabase Storage에 공개 버킷 생성 → 업로드 → 공개 URL을 `supabase/seed.sql`의 각 매물 `images` 배열에 넣기.
- **`supabase/seed.sql`**을 실제 매물 6건으로 교체 후 SQL Editor에서 재실행.
- **`public/og-default.png`** (1200×630) 추가 — 카톡/검색 미리보기 썸네일.
- **`src/app/about/page.tsx`**의 25년 스토리·거래사례 문구를 실제 내용으로.

## 4. Netlify 배포
- **방법 A(권장)**: GitHub에 push → Netlify에서 repo 연결. 빌드는 `netlify.toml`이 처리(`@netlify/plugin-nextjs` 자동 설치).
- **방법 B**: `npx netlify deploy --build --prod`.
- Netlify → **Site settings → Environment variables**에 2번의 값 + `NEXT_PUBLIC_SITE_URL`(실도메인) + (선택) `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` 등록.
- 배포 후 확인: 홈 · 매물상세 · `/sitemap.xml` · `/robots.txt` 가 200이고, 매물상세 페이지 소스에 `application/ld+json` 과 OG 태그가 보이는지.

## 5. 검색 등록 (1회)
- **네이버 서치어드바이저** + **구글 서치콘솔**에 사이트 등록 → 소유확인(메타태그는 root `layout.tsx`의 `metadata.verification` 또는 `public/`에 파일) → `sitemap.xml` 제출.

## 6. 운영 (현재 단계)
- 새 매물 등록/수정: 지금은 `supabase/seed.sql` 수정(또는 Supabase 대시보드에서 `listings` 테이블 직접 편집) 후 재배포.
- **P2에서 "폰으로 큰 버튼" 어드민 UI**가 추가되면 사장님이 직접 등록/수정 예정.
- 네이버 지도 키가 없으면 상세페이지 지도는 "네이버 지도에서 위치 보기" 링크로 표시됩니다(정상 동작).

## 참고 문서
- 설계 스펙: `docs/superpowers/specs/2026-07-03-haengun-budongsan-website-design.md`
- 구현 계획(P1, 이후 P2~P4 예정): `docs/superpowers/plans/2026-07-03-haengun-budongsan-phase1-public-site.md`
