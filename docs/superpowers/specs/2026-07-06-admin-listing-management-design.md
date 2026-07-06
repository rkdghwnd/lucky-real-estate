# 행운부동산공인중개사사무소 매물 관리자 설계

작성일: 2026-07-06
상태: 사용자 승인 완료, 구현 계획 작성 전

## 1. 목표

현재 Next.js 공개 사이트 안에 `/admin` 관리 영역을 추가한다. 미리 만든 Supabase 계정 한 개만 로그인할 수 있으며, 관리자는 사무실 PC에서 매물을 등록·조회·수정하고 거래완료 처리할 수 있다.

핵심 성공 기준은 다음과 같다.

- 별도 백엔드와 별도 서브도메인을 만들지 않는다.
- 저장한 새 매물이 재배포 없이 홈, 매물 목록, 상세페이지에 즉시 나타난다.
- 로그인하지 않은 사용자와 허용되지 않은 Supabase 사용자는 DB와 Storage를 변경할 수 없다.
- 사진 업로드나 DB 저장이 일부 실패해도 불완전한 매물이 공개되지 않고 입력 내용이 유지된다.
- 거래가 끝난 매물은 영구 삭제하지 않고 `거래완료`로 보관하며 다시 공개할 수 있다.

## 2. 확인된 사용자 결정

- 관리 기기: 사무실 PC
- 배치: 현재 사이트의 `/admin`
- 로그인: 아이디와 비밀번호 모두 입력
- 계정: 미리 만든 고정 계정 한 개, 신규 계정 생성 불가
- 공개 방식: 저장 즉시 공개, 사용자용 임시저장 없음
- 삭제 의미: 영구 삭제 대신 `거래완료`
- 등록 폼: 한 페이지 구역형(A안)

로그인 아이디는 Supabase Auth의 이메일 주소를 사용한다. UI 라벨은 `아이디(이메일)`로 표시한다.

## 3. 현재 프로젝트 감사

### 3.1 기술 기반

- Next.js 16.2.10 App Router, React 19.2.4, TypeScript
- Supabase JS 2.110.0
- Tailwind CSS 4와 기존 UI 프리미티브
- Vitest와 Testing Library
- Netlify 배포

### 3.2 재사용 가능한 요소

- `listings` 테이블과 공개 매물 조회 계층이 이미 존재한다.
- `PropertyType`, `DealType`, `ListingStatus`, `ListingRow`, `Listing` 타입이 존재한다.
- 공개 목록, 카드, 상세, SEO, 사이트맵 코드가 매물 데이터를 사용하고 있다.
- 공개 사용자는 `공개` 매물만 읽는 RLS 정책의 기초가 있다.
- `images text[]`가 사진 순서를 보존할 수 있다.

### 3.3 반드시 해결할 제약

- 공개 상세 라우트가 `dynamicParams = false`이므로 빌드 시 생성되지 않은 새 slug는 404가 된다.
- 목록과 상세가 정적 생성 중심이라 관리자 저장 후 캐시 갱신 경로가 없다.
- 사진은 SQL 또는 Supabase 대시보드에서 URL을 직접 입력해야 한다.
- 현재 `admin(pin_hash)` 테이블은 실제 Supabase Auth 세션과 연결되어 있지 않다.
- `updated_at`은 기본값만 있고 UPDATE 때 자동 갱신되는 트리거가 없다.
- 지도는 Naver Maps 키와 허용 도메인 설정이 없으면 오류 안내를 표시한다.

개발 서버에서 확인된 누락 로고 요청(`/logos/*.png`)은 기존 공개 사이트 자산 문제다. 관리자 구현의 완료 조건에는 넣지 않되 별도 공개 사이트 정리 항목으로 남긴다.

## 4. 접근 방식 비교와 결정

### 4.1 같은 앱의 `/admin` — 채택

현재 저장소, 배포, 환경변수, Supabase 프로젝트를 그대로 사용한다. 공개 사이트와 관리자 사이트의 데이터 타입과 캐시 갱신 코드를 공유할 수 있어 운영 복잡도가 가장 낮다.

### 4.2 `admin.example.com` 별도 배포 — 제외

주소 분리는 분명하지만 별도 배포, 환경변수, 인증 쿠키와 CORS 설정이 추가된다. 관리자 한 명과 단일 사이트 규모에서는 비용 대비 이점이 없다.

### 4.3 Supabase 대시보드 직접 사용 — 제외

개발량은 적지만 컴퓨터에 익숙하지 않은 운영자가 테이블, 배열, Storage URL을 직접 다뤄야 한다. 오입력과 삭제 위험이 크다.

## 5. 전체 아키텍처

```text
사무실 PC
  └─ /admin/login
       └─ Supabase Auth 이메일·비밀번호 로그인
            └─ 쿠키 기반 SSR 세션
                 └─ /admin 보호 레이아웃
                      ├─ 매물 목록
                      ├─ 등록/수정 Server Action
                      └─ 사진 Storage 직접 업로드

모든 데이터 요청
  └─ Supabase Postgres / Storage RLS
       └─ admin_users에 등록된 auth.uid()만 쓰기 허용

저장 성공
  └─ Next.js revalidatePath
       ├─ /
       ├─ /listings
       ├─ /listings/[slug]
       └─ /sitemap.xml
```

### 5.1 Supabase 클라이언트

`@supabase/ssr`를 추가하고 브라우저 클라이언트와 서버 클라이언트를 분리한다.

- 브라우저 클라이언트: 로그인 UI 상태와 인증된 Storage 업로드
- 서버 클라이언트: Server Component, Server Action, 보호 레이아웃
- `src/proxy.ts`: `/admin` 요청의 토큰 갱신과 낙관적 리다이렉트만 담당
- 보호 레이아웃과 모든 변경 Action: `getClaims()`로 서명된 토큰을 검증하고 `is_admin()`을 확인
- Postgres/Storage RLS: 최종 권한 경계

Proxy는 완전한 권한 검증 계층으로 사용하지 않는다. Next.js 공식 문서도 Proxy를 전체 세션 관리나 권한 부여의 유일한 수단으로 사용하지 말라고 안내한다.

### 5.2 Service Role 키

웹 앱에는 Service Role 키를 추가하지 않는다. 브라우저와 서버 모두 publishable/anon 키와 로그인 사용자의 JWT를 사용한다. 권한은 RLS로 제한한다.

## 6. 인증과 권한 설계

### 6.1 계정 생성과 로그인

1. Supabase Dashboard의 Authentication Users에서 관리자 이메일 계정 한 개를 수동 생성한다.
2. 이메일 로그인을 활성화하고 `Allow new users to sign up`을 끈다.
3. Anonymous Sign-In도 끈다.
4. 생성된 `auth.users.id`를 `public.admin_users`에 한 건 등록한다.
5. `/admin`에는 회원가입 링크를 만들지 않는다.

비밀번호 재설정은 고정 계정 이메일로만 보낸다. Netlify 운영 URL과 로컬 URL을 Supabase Redirect URL 허용 목록에 등록한다.

### 6.2 관리자 허용 목록

기존 `admin(pin_hash)` 방식은 사용하지 않는다. 빈 테이블임을 구현 전에 확인하고 백업 후 제거한다. 다음 구조로 대체한다.

```sql
create table public.admin_users (
  singleton boolean primary key default true check (singleton),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
```

`singleton`은 항상 `true`여야 하므로 테이블에는 최대 한 행만 존재할 수 있다. `public.is_admin()`은 `security definer`, 빈 `search_path`, 고정된 완전 수식 테이블명을 사용해 현재 `auth.uid()`가 이 한 행의 `user_id`와 같은지만 반환한다. `authenticated` 역할에 실행 권한만 부여한다.

### 6.3 `listings` 정책

- `anon SELECT`: `status = '공개'`
- 관리자 SELECT: `is_admin()`이 참이면 모든 상태 조회
- 관리자 INSERT: `is_admin()`이고 저장 상태가 `공개`
- 관리자 UPDATE: 기존 행과 새 행 모두 `is_admin()` 조건
- DELETE: 정책을 만들지 않는다.

관리 화면의 삭제 동작은 `status = '거래완료'` UPDATE다. 기존 `비공개` 값이 있다면 마이그레이션에서 `거래완료`로 변경한 뒤 UI와 체크 제약은 `공개 | 거래완료` 두 상태로 통일한다.

### 6.4 Storage 정책

공개 버킷 `listing-images`를 사용한다.

- 공개 읽기: 공개 상세페이지와 카드 이미지 표시
- 관리자 INSERT/UPDATE/DELETE: `bucket_id = 'listing-images' and is_admin()`
- 객체 경로: `{listing_id}/{random_uuid}.webp`
- 브라우저에 Service Role 키를 노출하지 않는다.

거래완료 시 사진은 유지한다. 다시 공개할 때 즉시 복원할 수 있고, 공개 URL을 이미 아는 사람이 사진 파일을 직접 여는 것까지 차단할 필요는 없는 공개 매물 이미지이기 때문이다.

## 7. 데이터 모델

### 7.1 기존 `listings` 유지

현재 컬럼을 유지하고 다음만 보강한다.

- `status`: 관리자 UI에서는 `공개 | 거래완료`
- `updated_at`: UPDATE마다 `now()`로 설정하는 트리거
- `slug`: 서버가 최초 등록 때 자동 생성하며 수정 화면에는 노출하지 않음
- `images`: 순서가 곧 표시 순서이며 첫 항목이 대표사진

새 slug 형식은 `listing-YYYYMMDD-{6자리 랜덤값}`으로 한다. 기존 slug는 변경하지 않는다. 제목 수정으로 URL이 바뀌지 않아 공유 링크와 SEO 주소가 안정적으로 유지된다.

### 7.2 이미지 값 호환

신규 업로드는 `images` 배열에 Storage 객체 경로를 저장한다. 기존 데이터의 절대 URL도 계속 지원하도록 데이터 접근 계층에서 다음 규칙으로 변환한다.

- `https://` 또는 `http://`로 시작: 기존 URL을 그대로 사용
- 그 외: `listing-images` 버킷의 public URL로 변환

이 방식은 현재 `images text[]`와 배열 순서를 유지하면서 객체 삭제와 교체를 안전하게 만든다.

### 7.3 가격과 면적 단위

- DB 가격 단위: 원 정수
- 매매: `price = 매매가`
- 임대: `price = 보증금`, `monthly_rent = 월세`
- 관리자 입력 단위: 만원
- 입력 중 원 단위 표시 문구를 실시간 제공
- 면적 입력 단위: ㎡, 평 자동 환산 표시

운영자가 `1850000000` 같은 원 단위 숫자를 직접 입력하게 하지 않는다. `185000`만원을 입력하면 `18억 5,000만원`으로 미리 보여준다.

## 8. 라우트와 화면 구조

관리 영역은 공개 사이트의 Header, Footer, 전화 CTA를 사용하지 않는 별도 레이아웃이다.

| 경로 | 역할 |
|---|---|
| `/admin/login` | 아이디(이메일)·비밀번호 로그인, 비밀번호 재설정 |
| `/admin` | 공개/거래완료 수, 검색, 매물 목록, 상태 변경 |
| `/admin/listings/new` | 한 페이지 구역형 신규 등록 |
| `/admin/listings/[id]/edit` | 기존 값이 채워진 동일 폼 |
| `/admin/auth/callback` | 비밀번호 재설정 등 Auth 리다이렉트 처리 |

### 8.1 로그인

- 행운부동산공인중개사사무소 로고와 `매물 관리자` 제목
- 아이디(이메일), 비밀번호, 로그인 버튼
- 회원가입 링크 없음
- 잘못된 아이디와 비밀번호는 구분하지 않고 `아이디 또는 비밀번호를 확인해주세요`로 표시
- 성공 시 원래 요청한 관리자 주소 또는 `/admin`으로 이동

### 8.2 매물 목록

- 상단: `새 매물 등록`, `사이트 보기`, 현재 아이디, 로그아웃
- 요약: 공개 중 건수, 거래완료 건수
- 검색: 제목 또는 주소
- 기본 정렬: `updated_at desc`
- 행: 대표사진, 제목/주소, 종류/거래유형, 가격, 상태, 수정, 거래완료/다시 공개
- 거래완료 확인 문구: `공개 사이트에서 즉시 숨겨집니다. 거래완료로 변경할까요?`
- 다시 공개 확인 문구: `이 매물을 공개 사이트에 다시 표시할까요?`

MVP에서는 서버 페이지네이션을 만들지 않고 전체 목록을 최근 수정순으로 표시한다. 실제 매물이 100건을 넘으면 페이지네이션을 별도 작업으로 추가한다.

### 8.3 한 페이지 구역형 폼

왼쪽 구역 바로가기와 오른쪽 입력 영역을 사용한다.

1. 기본정보: 제목, 매물 종류, 거래 유형
2. 가격·면적: 매매가 또는 보증금/월세, 대지면적, 건물면적, 준공연도
3. 위치·상세: 주소, 용도지역, 지목, 도로, 층고, 전력, 설명
4. 사진: 업로드, 대표사진, 순서 변경, 제거

하단에는 고정된 `취소`와 `등록하고 공개` 또는 `수정 내용 저장` 버튼을 둔다. 저장 오류가 있으면 첫 오류 구역으로 스크롤하고 해당 필드에 포커스를 옮긴다.

기술 필드인 id, slug, status, Storage 경로, updated_at은 운영자가 입력하지 않는다. 위도·경도도 일반 입력에서 숨긴다.

### 8.4 주소와 지도

주소는 필수다. 기존 Naver Maps Client ID와 허용 도메인이 정상 설정된 경우 주소 검색 후 좌표와 지도 미리보기를 자동 채운다. 지도 API를 사용할 수 없으면 주소 저장은 허용하고 위도·경도는 null로 둔다. 지도 실패가 매물 등록을 막아서는 안 된다.

## 9. 검증 규칙

클라이언트 편의 검증과 Server Action의 권한 있는 검증이 같은 스키마를 공유한다. 서버 검증이 최종 기준이다.

- 제목: 2~80자, 필수
- 매물 종류: 공장, 창고, 토지, 기타 중 하나
- 거래 유형: 매매, 임대 중 하나
- 주소: 5~200자, 필수
- 매매: 매매가 0보다 큼, 월세 null
- 임대: 보증금 0 이상, 월세 0보다 큼
- 대지/건물면적: 입력한 경우 0보다 큼
- 준공연도: 입력한 경우 1900~현재 연도+1
- 층고: 입력한 경우 0보다 큼
- 설명: 최대 5,000자
- 위도: 입력한 경우 -90~90
- 경도: 입력한 경우 -180~180
- 사진: 1~20장, JPG/PNG/WebP

사진 원본은 한 장당 최대 20MB까지 선택할 수 있다. 브라우저에서 긴 변 최대 2,000px, WebP 약 0.82 품질로 변환하고 결과가 5MB를 넘으면 등록을 막고 더 작은 사진을 안내한다. 이는 Supabase가 6MB 이하 파일에는 표준 업로드를 권장하는 기준 안에 둔다.

## 10. 사진 업로드와 저장 원자성

Storage와 Postgres를 하나의 트랜잭션으로 묶을 수 없으므로 다음 순서로 공개 원자성을 보장한다.

### 10.1 신규 등록

1. 브라우저와 서버 공통 규칙으로 필드를 검증한다.
2. 브라우저에서 새 listing UUID를 만든다.
3. 사진을 최적화하고 최대 3개씩 동시 업로드한다.
4. 각 사진은 `대기 | 업로드 중 | 완료 | 실패` 상태를 표시한다.
5. 모든 사진이 성공한 뒤 Server Action으로 매물 행을 `공개` 상태로 INSERT한다.
6. INSERT가 실패하면 이번 작업에서 업로드한 객체를 최선 노력으로 삭제한다.
7. 삭제 정리에 실패한 객체는 공개 매물에 연결되지 않은 고아 파일일 뿐이며 오류 로그에 남긴다.

사진 업로드 중에는 Postgres에 매물 행이 없으므로 부분 업로드가 공개 사이트에 나타나지 않는다.

### 10.2 수정

1. 새 사진을 먼저 업로드한다.
2. 기존 유지 사진과 새 사진의 최종 순서로 `images` 배열을 UPDATE한다.
3. DB UPDATE 성공 후 제거된 기존 Storage 객체를 삭제한다.
4. 객체 삭제 실패는 매물 표시를 깨뜨리지 않으므로 경고 로그만 남긴다.

### 10.3 진행률

MVP 진행률은 바이트 퍼센트가 아니라 사진별 상태와 `3/8장 완료`처럼 표시한다. 최적화 후 파일이 5MB 이하이므로 Supabase 표준 업로드를 사용하고 TUS 업로더는 도입하지 않는다.

## 11. 공개 사이트 즉시 반영

### 11.1 상세 라우트

`src/app/listings/[slug]/page.tsx`의 `dynamicParams = false`를 제거한다. 기존 slug는 빌드 시 생성하고, 새 slug는 첫 방문 때 렌더링할 수 있게 한다. 정적/ISR의 장점은 유지하되 새 경로를 차단하지 않는다.

### 11.2 변경 후 경로 갱신

등록, 수정, 거래완료, 다시 공개 성공 후 서버에서 다음을 갱신한다.

```ts
revalidatePath('/');
revalidatePath('/listings');
revalidatePath(`/listings/${slug}`);
revalidatePath('/sitemap.xml');
```

slug는 수정되지 않는다. 거래완료 후 상세 조회는 공개 상태가 아니므로 404를 반환하고, 다시 공개하면 같은 URL로 복원된다.

Netlify의 Next.js 런타임에서 on-demand revalidation이 실제 운영 배포에서도 동작하는지 스테이징 검증 항목에 포함한다.

## 12. 오류 처리

### 12.1 원칙

- 기술 오류 문자열을 운영자에게 그대로 노출하지 않는다.
- 실패해도 폼 입력과 선택 사진 상태를 유지한다.
- 저장 중 버튼을 비활성화해 중복 제출을 막는다.
- 권한 오류는 `로그인이 만료되었습니다. 다시 로그인해주세요.`로 안내한다.
- 네트워크 오류는 재시도 버튼을 제공한다.
- 업로드 실패는 실패한 사진만 다시 시도할 수 있게 한다.

### 12.2 사용자 메시지

| 상황 | 메시지 |
|---|---|
| 로그인 실패 | 아이디 또는 비밀번호를 확인해주세요. |
| 필수값 누락 | 표시된 필수항목을 입력해주세요. |
| 사진 형식/크기 오류 | JPG, PNG, WebP 사진을 사용해주세요. 사진이 너무 크면 더 작은 파일을 선택해주세요. |
| 일부 업로드 실패 | 업로드하지 못한 사진이 있습니다. 실패한 사진만 다시 시도해주세요. |
| 저장 실패 | 매물을 저장하지 못했습니다. 입력 내용은 그대로 유지됩니다. 다시 시도해주세요. |
| 등록 성공 | 매물이 공개되었습니다. |
| 수정 성공 | 수정 내용이 공개 사이트에 반영되었습니다. |
| 거래완료 성공 | 거래완료로 변경했습니다. 공개 사이트에서는 숨겨집니다. |

## 13. 범위

### 13.1 MVP 포함

- 고정 계정 로그인, 로그아웃, 비밀번호 재설정
- 신규 가입 차단과 관리자 UID 허용 목록
- 보호된 매물 목록과 검색
- 등록, 조회, 수정
- 거래완료와 다시 공개
- 사진 1~20장 업로드, 제거, 순서 변경, 대표사진
- 입력 검증과 실패 복구
- 홈, 목록, 상세, 사이트맵 즉시 갱신
- DB와 Storage RLS
- PC 우선 UI, 모바일에서도 기본 기능은 사용 가능

### 13.2 MVP 제외

- 다중 관리자와 역할 등급
- 사용자용 임시저장과 예약 공개
- 영구 삭제 UI
- 드래그 방식 지도 핀 정밀 조정
- AI 설명 생성
- 엑셀/CSV 일괄등록
- 문의함과 블로그 관리
- 관리자 활동 이력 테이블
- 100건 이하에서의 페이지네이션

## 14. 테스트 전략

### 14.1 단위 테스트

- 매매/임대 조건부 가격 검증
- 만원 입력을 원 단위로 변환하고 표시 문자열 생성
- 면적 ㎡/평 변환
- slug 생성의 형식과 충돌 재시도
- 기존 절대 URL과 신규 Storage 경로 이미지 해석
- 사진 수, 형식, 크기 검증
- 서버 입력 스키마가 잘못된 listing UUID와 임의의 status, slug, updated_at을 거부

### 14.2 컴포넌트 테스트

- 로그인 오류와 로딩 상태
- 목록의 공개/거래완료 필터와 검색
- 거래완료/다시 공개 확인 Dialog
- 거래 유형에 따른 가격 입력 변경
- 필수 필드 오류 발생 시 구역 이동
- 사진 순서 변경 시 대표사진 변경
- 업로드 실패 사진만 재시도
- 저장 중 중복 제출 방지

### 14.3 RLS 통합 검증

다음 역할을 각각 실행해 결과를 확인한다.

- anon: 공개 매물 SELECT 성공, 거래완료 SELECT 실패, 모든 쓰기 실패
- 로그인했지만 허용 목록에 없는 사용자: 관리자 SELECT/INSERT/UPDATE와 Storage 쓰기 실패
- 허용 관리자: 전체 SELECT, INSERT, UPDATE, Storage 쓰기 성공
- 허용 관리자도 listings DELETE 실패

### 14.4 브라우저 인수 테스트

1. 비로그인 `/admin` 접근 시 로그인으로 이동한다.
2. 잘못된 로그인은 일반 오류만 표시한다.
3. 사진을 포함한 새 매물을 등록하면 `/listings`와 새 상세 URL에 즉시 나타난다.
4. 가격과 사진 순서를 수정하면 공개 상세가 즉시 바뀐다.
5. 거래완료 시 목록과 상세에서 사라지고 관리자 거래완료 목록에 남는다.
6. 다시 공개하면 동일 slug로 복원된다.
7. 사진 업로드 실패 시 DB 행이 생성되지 않는다.
8. Naver Maps 키가 없거나 실패해도 주소 기반 매물 등록은 성공한다.
9. 로그아웃 후 보호 페이지에 재접근할 수 없다.

## 15. 배포와 운영 전환

1. Supabase DB와 기존 Storage 데이터를 백업한다.
2. SQL 마이그레이션으로 `admin_users`, `is_admin()`, RLS, updated_at 트리거를 적용한다.
3. `listing-images` 공개 버킷과 쓰기 정책을 만든다.
4. Auth 관리자 계정을 수동 생성하고 신규 가입/익명 가입을 끈다.
5. 관리자 UID를 `admin_users`에 등록한다.
6. 로컬에서 RLS와 전체 CRUD를 검증한다.
7. Netlify Preview 배포에서 Auth Redirect URL, 쿠키, Storage, revalidation을 검증한다.
8. 운영 배포 후 실제 관리자 계정으로 테스트 매물 1건을 등록·수정·거래완료·복구한다.
9. 1페이지짜리 운영 안내서를 제공한다.

새로운 비공개 서버 키는 필요하지 않다. 기존 Supabase URL과 publishable/anon 키, 사이트 URL, 선택적인 Naver Maps Client ID를 사용한다.

## 16. 구현 경계와 예상 파일 구조

세부 구현 계획에서 정확한 파일별 작업을 확정하되 책임 경계는 다음과 같이 둔다.

```text
src/
  app/
    admin/
      login/page.tsx
      auth/callback/route.ts
      (protected)/layout.tsx
      (protected)/page.tsx
      (protected)/listings/new/page.tsx
      (protected)/listings/[id]/edit/page.tsx
      actions.ts
    listings/[slug]/page.tsx
  components/admin/
    AdminHeader.tsx
    ListingTable.tsx
    ListingForm.tsx
    ImageUploader.tsx
    ListingStatusDialog.tsx
  lib/
    admin/auth.ts
    admin/listing-schema.ts
    admin/images.ts
    supabase/client.ts
    supabase/server.ts
    supabase/proxy.ts
  proxy.ts
supabase/
  migrations/<timestamp>_admin_listing_management.sql
```

파일 책임은 인증, 입력 검증, 이미지 처리, 화면 표시를 분리한다. 기존 공개 매물 타입과 포맷 함수는 중복 정의하지 않고 공유한다.

## 17. 위험과 완화

| 위험 | 완화 |
|---|---|
| 새 slug가 운영에서 404 | `dynamicParams = false` 제거, Preview에서 신규 slug 인수 테스트 |
| Auth 쿠키를 신뢰한 권한 우회 | 서버 `getClaims()`, `is_admin()`, DB/Storage RLS 삼중 경계 |
| 사진 일부 업로드 후 DB 실패 | DB 저장을 마지막에 수행하고 업로드 객체 정리 |
| 수정 중 객체 삭제 실패 | DB에는 최종 배열을 먼저 저장하고 고아 객체는 로그 후 정리 |
| 큰 사진으로 업로드 실패 | 브라우저 리사이즈/WebP 변환, 결과 5MB 제한 |
| Naver 지도 설정 누락 | 주소 저장과 공개를 막지 않고 지도는 선택 기능으로 처리 |
| `@supabase/ssr` API 변경 | package-lock으로 버전을 고정하고 업그레이드 시 Auth 테스트 실행 |
| Netlify 캐시가 즉시 갱신되지 않음 | Preview에서 on-demand revalidation을 배포 전 필수 검증 |

## 18. 완료 정의

다음 조건을 모두 만족하면 MVP를 완료한 것으로 본다.

- 고정 관리자 계정만 `/admin`에 들어갈 수 있다.
- 공개 키만으로 listings와 listing-images를 변경할 수 없다.
- 운영자가 PC에서 한 페이지 폼으로 사진 포함 매물을 등록하고 수정할 수 있다.
- 저장 직후 홈, 목록, 상세, 사이트맵이 새 데이터를 제공한다.
- 거래완료와 다시 공개가 데이터 손실 없이 동작한다.
- 실패 시 입력이 유지되고 불완전한 공개 매물이 생성되지 않는다.
- 단위, 컴포넌트, RLS, 브라우저 인수 검증을 통과한다.
- Netlify Preview와 운영 배포에서 실제 계정으로 최종 검증한다.

## 19. 참고 문서

- Supabase Next.js SSR: https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs
- Supabase Auth 일반 설정: https://supabase.com/docs/guides/auth/general-configuration
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage 접근 제어: https://supabase.com/docs/guides/storage/security/access-control
- Supabase 표준 업로드: https://supabase.com/docs/guides/storage/uploads/standard-uploads
- Next.js Proxy: https://nextjs.org/docs/app/getting-started/proxy
- Next.js `generateStaticParams`: https://nextjs.org/docs/app/api-reference/functions/generate-static-params
- Next.js `revalidatePath`: https://nextjs.org/docs/app/api-reference/functions/revalidatePath
