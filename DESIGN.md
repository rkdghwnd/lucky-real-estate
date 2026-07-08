# DESIGN.md — 행운부동산공인중개사사무소 디자인 토큰 계약

Ant Design 위에 얹은 얇은 토큰 레이어. **모든** 색·크기·간격·반경·그림자는 여기 토큰을 따른다.
antd 컴포넌트는 `AntdProvider`의 theme 토큰으로, 커스텀(Tailwind) 섹션은 `globals.css`의 `@theme`
변수로 이 계약을 구현한다. raw hex·매직 간격 금지. 없는 값이 필요하면 먼저 이 문서에 토큰을 추가한다.

## 1. Atmosphere
신뢰·실무·명료. 밝은 중립 배경 위에 **한 가지 파랑** 강조와 실제 사진(배너·매물)이 주인공.
프레임워크 기본 티를 줄인 "정돈된 antd" — 타입 스케일·여백 리듬·깊이 ladder로 완성도를 올린다.
대상은 사업자 + 고령 운영자 → 큰 본문(16px 기준), 넉넉한 터치 타깃, 절제된 모션.

## 2. Color (accent lock: 토스 블루 단일 파랑)
- **Accent** `--color-brand #3182f6` · dark `#1b64da` · light `#e8f3ff` — 전 페이지 단일 강조색 (TDS).
- **Neutrals** ink `#191f28` · muted `#4e5968` · canvas `#ffffff` ·
  surface `#f2f4f6`(토스 라이트그레이) · hairline `#e5e8eb` · hairline-soft `#f8f9fa`.
- **Semantic** 매매=`#3182f6` · 임대=`#059669` · danger `#f04452`.
- 잠금: 섹션마다 강조색을 바꾸지 않는다. 토스 고유의 청량한 블루와 맑은 뉴트럴을 엄격히 고수한다.

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
- 반경: 기본 `12`, 카드 `18` 또는 `24`, 버튼 및 입력 단독 요소 `12`. 토스 특유의 둥글고 시원한 코너 반경을 일관되게 고수한다.
- Card = 주 표면 (hoverable 매물 카드는 hover 시 `translateY(-4px)` + `--shadow-floating`, 300ms ease-out). Button 강조는 primary(토스 블루), 보조는 bg-surface (토스 그레이 배경).
- 폼: Select/Input/InputNumber `size="large"`, `controlHeight="48"`. Tag로 거래유형(매매 파랑 / 임대 녹색)·종류 표기.
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
