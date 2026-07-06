# DESIGN.md — 행운부동산공인중개사사무소 디자인 토큰 계약

Ant Design 위에 얹은 얇은 토큰 레이어. **모든** 색·크기·간격·반경·그림자는 여기 토큰을 따른다.
antd 컴포넌트는 `AntdProvider`의 theme 토큰으로, 커스텀(Tailwind) 섹션은 `globals.css`의 `@theme`
변수로 이 계약을 구현한다. raw hex·매직 간격 금지. 없는 값이 필요하면 먼저 이 문서에 토큰을 추가한다.

## 1. Atmosphere
신뢰·실무·명료. 밝은 중립 배경 위에 **한 가지 파랑** 강조와 실제 사진(배너·매물)이 주인공.
프레임워크 기본 티를 줄인 "정돈된 antd" — 타입 스케일·여백 리듬·깊이 ladder로 완성도를 올린다.
대상은 사업자 + 고령 운영자 → 큰 본문(16px 기준), 넉넉한 터치 타깃, 절제된 모션.

## 2. Color (accent lock: 파랑 하나)
- **Accent** `--color-brand #1677ff` · dark `#0958d9` · light `#e6f4ff` — 전 페이지 단일 강조색.
- **Neutrals** ink `#0a0b0d`(순수 #000 아님) · muted `#5b616e` · canvas `#ffffff` ·
  surface `#f7f8fa`(라이트 밴드/푸터/유틸바) · hairline `#dee1e6` · hairline-soft `#eef0f3`.
- **Semantic** 매매=`#1677ff` · 임대=`#059669` · danger `#dc2626`.
- 잠금: 섹션마다 강조색을 바꾸지 않는다(warm-grey 사이트에 7번 섹션만 다른 파랑 CTA 금지).

## 3. Typography (Noto Sans KR, 400/500/700)
- Root `18px`. antd base `fontSize 16`(고령 가독성 + 커스텀 섹션과 일치).
- Scale(Tailwind + antd heading 토큰):
  display `3rem–3.75rem/900`(히어로) · h1 `1.7rem/800` · h2 `1.5rem/700` ·
  h3 `1.25rem/700` · body-lg `1.125rem/400` · body `1rem/400` · caption `0.8rem/500`.
- 잠금: 단일 패밀리. Inter/Roboto 기본 금지(한국어 전용 Noto Sans KR은 의도된 선택).

## 4. Spacing (4px base)
- 스케일: 4·8·12·16·24·32·48·64 (Tailwind 1·2·3·4·6·8·12·16).
- 섹션 리듬: 콘텐츠 세로 간격 `space-y-12`, 페이지 하단 `pb-16`, 카드 내부 20–24.
- 매직 간격 금지 — 위 스케일만.

## 5. Components (antd, themed)
- 반경: 기본 `8`, 카드 `12`, 작은 요소 `6`. 하나의 radius 스케일 잠금.
- Card = 주 표면(hoverable 매물 카드는 hover lift). Button 강조는 primary, 보조는 default.
- 폼: Select/Input/InputNumber `size="large"`. Tag로 거래유형(매매 파랑 / 임대 녹색)·종류 표기.
- 상태: hover/active/focus/disabled 항상 처리. 빈 상태 = antd `Empty`.
  공개 페이지는 SSG라 로딩/에러 상태는 대부분 N/A(있으면 명시 처리).

## 6. Motion (MOTION_INTENSITY 2 — 절제)
- GPU 합성만: `transform`/`opacity`/`filter`. layout 속성 애니메이션 금지.
- 카드 hover: `translateY(-2px)` + `--shadow-floating`, 160ms ease.
- 히어로 배너: autoplay 4.5s 슬라이드.
- `prefers-reduced-motion: reduce` → 모든 트랜지션/애니메이션/오토플레이 무력화(globals.css 가드).

## 7. Depth (elevation ladder — ink 틴트, flat #000 그림자 금지)
절제가 원칙: 그림자를 모든 카드에 뿌리지 않는다.
- **flat** (hairline 보더만): 정적 콘텐츠 카드(트러스트·CTA·사이드바·특징)·표·상세 스펙표.
- **raised** `--shadow-raised`: 인터랙티브 카드의 hover — 매물 카드는 hover 시 `translateY(-4px)` + 그림자, 커버 이미지 `scale(1.05)`.
- **floating** `--shadow-floating`: 히어로 위 검색바·모달·드로어(항상 떠 있는 요소).
- 단일 generic 그림자 금지 — 위 3단 ladder만.

---
구현: antd 토큰 → `src/components/providers/AntdProvider.tsx` · CSS 변수 → `src/app/globals.css`.
검증: `node skills/superloopy-frontend/scripts/ds-compliance.mjs DESIGN.md <files>` + 실브라우저 시각-QA.
