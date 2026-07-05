# 행운부동산 운영·배포 가이드

공개 사이트와 `/admin` 매물 관리 화면을 처음 연결할 때 사용하는 운영 런북입니다.

## 1. 준비물과 로컬 실행

- Node.js 20 이상, npm
- Supabase 프로젝트
- Netlify 프로젝트
- 선택: 네이버 클라우드 플랫폼 Maps API 키

```powershell
npm.cmd install
Copy-Item .env.local.example .env.local
npm.cmd run dev
```

기본 로컬 주소는 `http://localhost:3000`입니다. 공개 매물 페이지는 Supabase 값을 필수로 사용하므로 `.env.local`을 먼저 채워야 합니다.

## 2. Supabase 데이터베이스와 Storage

새 프로젝트라면 Supabase Dashboard의 **SQL Editor**에서 `supabase/schema.sql`을 실행합니다. 이미 공개 사이트가 운영 중이라면 다음 마이그레이션만 실행합니다.

```text
supabase/migrations/20260706010000_admin_listing_management.sql
```

마이그레이션은 다음을 설정합니다.

- `admin_users` 고정 관리자 테이블과 `is_admin()` 권한 함수
- 공개 사용자에게는 `공개` 매물만 보이는 RLS
- 관리자에게만 매물 등록·수정 권한 부여
- 영구 삭제 차단, `공개`/`거래완료` 상태만 허용
- 공개 `listing-images` 버킷, 5MB 저장 제한, 관리자 전용 업로드·수정·삭제 정책

주의: 과거 PIN 방식의 `public.admin` 테이블에 데이터가 있으면 마이그레이션이 의도적으로 중단됩니다. 먼저 해당 데이터를 백업한 뒤 다시 실행합니다.

SQL Editor에서 아래 결과를 확인합니다.

```sql
select tablename, policyname from pg_policies
where schemaname = 'public' and tablename in ('listings', 'admin_users');

select id, public, file_size_limit
from storage.buckets
where id = 'listing-images';
```

## 3. 단 하나의 관리자 계정 만들기

계정은 사이트에서 가입하지 않습니다.

1. Supabase Dashboard → **Authentication → Users**에서 이메일/비밀번호 사용자를 한 명 직접 만듭니다.
2. 생성된 사용자의 UUID를 복사합니다.
3. SQL Editor에서 아래 SQL의 UUID를 바꿔 실행합니다.

```sql
insert into public.admin_users (singleton, user_id)
values (true, 'AUTH-USER-UUID')
on conflict (singleton) do update set user_id = excluded.user_id;
```

4. **Authentication → General Configuration**에서 **Allow new users to sign up**을 끕니다.
5. 같은 화면에서 **Allow anonymous sign-ins**도 끕니다.

`admin_users.singleton`이 기본 키이므로 관리자 계정은 항상 한 명만 유지됩니다. 계정을 교체할 때는 새 Auth 사용자를 만든 뒤 위 SQL을 다시 실행합니다.

## 4. 인증 URL 설정

Supabase Dashboard → **Authentication → URL Configuration**에서 설정합니다.

- **Site URL**: 실제 운영 주소, 예: `https://haengun.example.com`
- **Redirect URLs**:
  - `http://localhost:3000/**`
  - `https://haengun.example.com/admin/auth/callback?next=/admin/reset-password`
  - Netlify Preview를 쓸 때: `https://**--YOUR-SITE.netlify.app/**`

운영 도메인이 바뀌면 Supabase의 Site URL/Redirect URLs와 배포 환경의 `NEXT_PUBLIC_SITE_URL`을 함께 바꿉니다. 비밀번호 재설정 메일이 다른 주소로 가면 이 세 값이 일치하는지 먼저 확인합니다.

## 5. 환경 변수

Supabase Dashboard → **Project Settings → API**에서 Project URL과 publishable/anon key를 복사합니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
NEXT_PUBLIC_SITE_URL=https://haengun.example.com
NEXT_PUBLIC_NAVER_MAP_CLIENT_ID=
```

동일한 값을 로컬 `.env.local`과 Netlify **Site configuration → Environment variables**에 설정합니다.

이 프로젝트는 `SUPABASE_SERVICE_ROLE_KEY`를 사용하지 않습니다. 브라우저와 서버 액션 모두 공개 키 + 로그인 세션 + RLS로 권한을 확인합니다. Service Role 키를 `NEXT_PUBLIC_` 변수나 Netlify 환경 변수에 추가하지 마세요.

## 6. 배포 전 확인

```powershell
npm.cmd test
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```

Netlify는 GitHub 저장소를 연결하면 `netlify.toml` 설정으로 빌드합니다. 배포 후 다음 주소가 정상인지 확인합니다.

- `/`, `/listings`, 실제 `/listings/{slug}`
- `/sitemap.xml`, `/robots.txt`
- `/admin/login`, `/admin/forgot-password`
- 로그인 전 `/admin` 접근 시 `/admin/login`으로 이동

## 7. 관리자 인수 테스트

PC에서 아래 순서대로 한 번씩 확인합니다.

1. `/admin/login`에서 고정 이메일과 비밀번호로 로그인합니다.
2. **새 매물 등록**에서 필수 정보와 사진을 넣어 저장합니다.
3. 공개 `/listings`와 새 상세 페이지에서 즉시 보이는지 확인합니다.
4. 관리자에서 제목과 사진 순서를 수정하고 공개 페이지 반영을 확인합니다.
5. **거래완료로 변경** 후 공개 목록과 상세에서 사라지는지 확인합니다.
6. 거래완료 탭에서 **다시 공개** 후 공개 페이지에 돌아오는지 확인합니다.
7. 로그아웃 후 `/admin`에 다시 접근할 수 없는지 확인합니다.
8. **비밀번호를 잊으셨나요?** 메일을 받아 새 비밀번호로 로그인합니다.

사진 업로드 중 저장에 실패하면 화면 값은 유지됩니다. 다시 저장하기 전에 네트워크와 Supabase Storage 정책을 확인합니다.

## 8. 실제 사업자 정보와 검색 등록

- `src/lib/site.ts`의 상호, 대표자명, 중개등록번호, 전화, 주소, 영업시간을 실제 정보로 교체합니다.
- `public/og-default.png`에 1200×630 기본 공유 이미지를 둡니다.
- 네이버 서치어드바이저와 구글 서치콘솔에 사이트를 등록하고 `/sitemap.xml`을 제출합니다.

## 참고 문서

- 관리자 설계: `docs/superpowers/specs/2026-07-06-admin-listing-management-design.md`
- 관리자 구현 계획: `docs/superpowers/plans/2026-07-06-admin-listing-management.md`
