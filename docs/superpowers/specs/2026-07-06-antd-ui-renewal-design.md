# Ant Design UI 리뉴얼 설계 (Design Spec)

**작성일:** 2026-07-06
**대상:** 행운부동산공인중개사사무소 공개 사이트 (Next.js 16 App Router · React 19 · SSG)
**결정:** 절충안 — **Tailwind 유지 + 브랜드 테마드 antd 공존**

---

## 1. 목표 (Goal)

현재 shadcn/ui(Radix + cva) 기반 UI를 **Ant Design v5** 기반으로 리뉴얼한다.
기능성 컴포넌트(버튼·폼·카드·테이블·페이지네이션 등)는 antd로 교체하고, `ConfigProvider`로
브랜드 블루(#0052ff) 테마를 입힌다. 히어로·다크 푸터·헤더 셸·404 일러스트 등 **바스포크 시각 섹션은
Tailwind 커스텀으로 유지**한다. 화면 구성·라우팅·URL 필터 의미·문구·데이터는 그대로 둔다.

## 2. 비목표 (Non-Goals)

- 신규 기능 추가 없음 (검색/필터/정렬/페이지네이션 동작은 현재와 동일).
- DB 스키마·시드 데이터·문구(카피) 변경 없음.
- `force-static` SSG, URL 기반 필터 상태(next/navigation), SEO(JsonLd/metadata) 유지.
- `NaverMap`/`ListingsMap`(현재 미사용)·`JsonLd`는 손대지 않음.
- **배포/푸시 없음** — 로컬 main 작업만. (오너 실데이터 대기 중, 표준 규칙)

## 3. 전역 제약 (Global Constraints)

- Next.js **16.2.10** / React **19.2.4** / Tailwind **v4** / TypeScript.
- antd는 **v5.22 이상**(React 19 공식 지원 버전) 고정.
- 아이콘은 **lucide-react 유지** — `@ant-design/icons`는 도입하지 않음(번들 절약). antd 내부 아이콘(Select 화살표, Modal 닫기 등)은 antd 자체 번들로 충당.
- 브랜드 테마 토큰은 §6 값으로 고정.
- 모든 사용자 문구·주소·전화번호는 `siteConfig`에서 계속 소싱.
- 컨트롤 크기는 **large(높이 40px)** 기본 — 고령 운영자·모바일 터치 대비.

## 4. 아키텍처 & 셋업

### 4.1 의존성
- 추가: `antd`(^5.22), `@ant-design/nextjs-registry`, `@ant-design/cssinjs`(StyleProvider 용, antd 피어).
- 교체 후 제거(마지막 정리 단계): `@radix-ui/react-dialog`, `@radix-ui/react-slot`, `class-variance-authority`, `tailwind-merge`, `tw-animate-css`(미사용 시). `clsx`는 잔존 커스텀에서 쓰면 유지.

### 4.2 Provider 구조
- `src/components/providers/AntdProvider.tsx` (`'use client'`):
  - `@ant-design/cssinjs`의 `StyleProvider`(`layer` 활성)로 antd 스타일을 CSS `@layer`에 배치.
  - `ConfigProvider`에 §6 `theme` + `locale={koKR}`(`antd/locale/ko_KR`) 주입.
  - children 래핑.
- `src/app/layout.tsx` (서버 컴포넌트): `<body>` 안에서
  `<AntdRegistry><AntdProvider>{children}</AntdProvider></AntdRegistry>` 순으로 감싼다.
  `AntdRegistry`(@ant-design/nextjs-registry)가 SSR/SSG 렌더 시 cssinjs 스타일을 추출·인라인해 FOUC를 방지.

### 4.3 Tailwind ↔ antd 충돌 방지
- Tailwind v4 Preflight(리셋)가 antd 컴포넌트 기본 스타일(버튼 배경/보더 등)을 덮어쓰는 알려진 충돌을 막기 위해 `StyleProvider layer`로 antd를 별도 cascade layer에 넣고, `globals.css`에서 레이어 우선순위를 조정한다.
- **수용 기준(Task 1):** antd `Button`(primary/default)·`Select`·`Input`이 기본 보더/배경/포커스링을 정상 렌더하고, Tailwind 유틸리티가 커스텀 섹션에서 계속 동작. `npm run build` 산출물에 antd 스타일이 인라인됨.

### 4.4 SSG 유지
- 모든 데이터 페이지는 계속 `force-static`. antd 컴포넌트는 클라이언트 컴포넌트지만, 서버 레이아웃이 클라이언트 Provider를 자식으로 렌더하는 패턴(직렬화 가능한 theme/locale 객체만 전달)으로 안전. `useSearchParams` 사용부(ListingBrowser)는 기존 `<Suspense>` 경계 유지.

## 5. 컴포넌트 이관 맵

### 5.1 antd로 교체

| 파일 | 현재 | 대상 antd | 비고 |
|---|---|---|---|
| `ui/button.tsx` 사용처 전역 | shadcn Button(cva) | `Button` | `type=primary`(brand)/`default`/`text`, size `large`. **링크 규칙:** `tel:`·내부경로 CTA는 antd `Button`에 `href` 지정(antd가 `<a class="ant-btn">`로 렌더 → 시맨틱 앵커·SSG·서버컴포넌트 호환). `<button>`을 `<a>`로 감싸는 무효 중첩 회피. SPA 클라이언트 네비 인터셉트는 선택(필수 아님). |
| `ui/badge.tsx` 사용처 | shadcn Badge | `Tag` | 거래유형(매매=brand, 임대=green)·매물종류 칩. |
| `ui/card.tsx` 사용처 | shadcn Card | `Card` | 아래 카드류에 사용. |
| `listings/ListingCard.tsx` | 커스텀 카드 | `Card`(cover=이미지, `Card.Meta`) + `Tag` | 사진 위 뱃지·종류칩, 제목·주소·면적·가격. Link 래핑 유지. |
| `home/SearchBar.tsx` | 커스텀 폼 | `Form`+`Select`+`Input`+`Button` | 거래유형/매물종류/지역 Select, 키워드 Input, 검색 Button. `onFinish`→URLSearchParams→`router.push`. |
| `listings/SearchFilters.tsx` | 커스텀 필터 | `Form`+`Radio.Group`+`Select`+`InputNumber`+`Button` | 거래/종류 Radio.Group, 지역 Select, 가격·면적 InputNumber 쌍, 검색/초기화. |
| `listings/ListingBrowser.tsx` | 오케스트레이터 | `Select`(정렬)+`Pagination`+`Empty` | 필터 상태 로직은 유지, UI 표면만 antd. |
| `listings/Pagination.tsx` | 커스텀 | `Pagination` | 파일 제거, ListingBrowser에서 antd 직접 사용. |
| `listings/Breadcrumb.tsx` | 커스텀 | `Breadcrumb` | `items` prop 매핑. |
| `listings/SpecTable.tsx` | 커스텀 표 | `Descriptions`(`bordered`, `column` 반응형) | 종류/소재지/가격/면적/용도지역/지목/도로/층고/전력/준공연도, null 필터. |
| `listings/ContactBox.tsx` | 커스텀 박스 | `Card` + `Button`(전화/문자) | 사무소명·전화(tel)·전화상담/문자문의. |
| `listings/ImageSlider.tsx` | 커스텀 슬라이더 | `Carousel` + `Image`(preview) | 화살표·인디케이터는 Carousel, 확대는 Image.preview. 빈 상태 "사진 준비중". |
| `about/page.tsx` 특징카드 | 커스텀 | `Card` | 4개 특징 카드; 사무소 정보 표는 `Descriptions`로 통일. |

### 5.2 커스텀(Tailwind) 유지
- `home/Hero.tsx`(풀블리드 히어로) — CTA만 antd `Button`.
- `home/TrustStrip.tsx`, `home/HomeCta.tsx`(다크 밴드; CTA만 antd Button), `home/FeaturedListings.tsx`(섹션 래퍼; 카드는 antd ListingCard).
- `layout/Footer.tsx`(다크 푸터) — 유지.
- `layout/Header.tsx` — 유틸바 + 로고 락업은 커스텀 유지; **CTA는 antd `Button`**, **모바일 메뉴는 antd `Drawer`**로 교체(현재 커스텀 fixed 오버레이 대체). 데스크톱 네비는 평문 링크 유지(antd Menu 스타일과 목업 룩 충돌 회피).
- `not-found.tsx`(404 SVG) — 버튼만 antd `Button`.
- 페이지 컨테이너/그리드 레이아웃(`max-w-6xl` 등) — Tailwind 유지.

## 6. 테마 토큰 (ConfigProvider)

```
theme = {
  token: {
    colorPrimary: '#0052ff',
    colorLink: '#0052ff',
    colorLinkHover: '#003ecc',
    borderRadius: 8,
    fontSize: 16,
    controlHeight: 40,        // large 기본 (터치·고령 대비)
    fontFamily: (시스템 폰트 상속),
  },
  // components: 필요 시 Button/Card 등 국소 오버라이드
}
locale = koKR
```

- 거래유형 색상: 매매=brand(primary), 임대=green(`Tag color="green"`) — 현재 규칙 유지.

## 7. 접근성 & 고령 사용자 대응
- 컨트롤 large(40px)·fontSize 16으로 큼직하게.
- 전화 CTA는 계속 `tel:` 링크(antd Button `href`).
- antd `Select`/`Radio` 포털 드롭다운도 큰 폰트 유지. 키보드·aria는 antd 기본 제공.

## 8. 테스트 전략 & 영향

- **유지(그대로 통과 기대):** `Footer.test`, `JsonLd.test`, `NaverMap.test`, `ListingsMap.test`(해당 컴포넌트 미변경). 검색 로직 `lib/search.ts` 테스트(무관, 유지).
- **재작성 필요:** `SearchBar.test`, `SearchFilters`(신규 테스트), `Pagination.test`(antd Pagination), `ListingCard.test`(antd Card DOM), `SpecTable.test`(Descriptions DOM), `ImageSlider.test`(Carousel/Image DOM), `Header.test`(Drawer).
  - antd `Select`/`Radio`는 네이티브가 아니라 포털·`role="combobox"`/커스텀 구조 → 상호작용 테스트는 antd 방식으로 조정(드롭다운 열기→옵션 클릭). 행동 커버리지(선택값→router.push, href, 노출 텍스트/role)는 보존.
- **커버리지 원칙:** 각 교체 컴포넌트는 최소 1개 행동 테스트 유지/신설. 총 테스트 수는 대략 현 수준(≈79) 유지 목표.

## 9. 리스크 & 완화

| 리스크 | 완화 |
|---|---|
| Tailwind Preflight ↔ antd 스타일 충돌 | `StyleProvider layer` + globals 레이어 순서; Task 1 수용 기준으로 검증. |
| React 19 + antd 정적 메서드(message/Modal.confirm) 비호환 | 정적 메서드 미사용(현 사이트에 토스트/컨펌 없음). 필요 시 `@ant-design/v5-patch-for-react-19` 국소 도입. |
| SSG cssinjs FOUC | `AntdRegistry`로 스타일 추출; build 산출물 인라인 확인. |
| antd 폼 DOM으로 테스트 재작성 비용 | 단계별로 컴포넌트와 함께 테스트 동반 수정. |
| 번들 증가("가벼움" 제약 상충) | 트리셰이킹 + lucide 유지 + 아이콘팩 미도입으로 최소화; 절충안 선택으로 감수. |

## 10. 진행 단계 (플랜에서 태스크로 상세화)

1. **셋업** — deps 설치, `AntdProvider`(StyleProvider+ConfigProvider+locale), layout에 `AntdRegistry` 배선, Tailwind 충돌 검증.
2. **공통 프리미티브** — Button/Tag/Card 교체 파일럿(Hero/HomeCta/404/헤더 CTA 버튼 + ListingCard).
3. **폼** — SearchBar, SearchFilters(antd Form/Select/Radio/InputNumber) + 테스트.
4. **상세 화면** — Breadcrumb, Descriptions(SpecTable), Carousel/Image(ImageSlider), ContactBox.
5. **목록 화면** — ListingBrowser(Select 정렬 / Pagination / Empty), Pagination.tsx 제거.
6. **헤더** — 모바일 메뉴 antd Drawer 전환.
7. **회사소개** — 특징 카드 antd Card, 사무소 Descriptions.
8. **정리 & 검증** — 미사용 `ui/*` + radix/cva/tw-merge 제거, 전체 `vitest`/`tsc`/`eslint`/`build` + 브라우저 검증, 커밋.

각 단계는 독립 테스트 가능한 산출물로 끝나며, TDD(로직) + 브라우저 검증(UI)을 따른다.
