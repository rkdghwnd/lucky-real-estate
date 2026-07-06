# 행운부동산공인중개사사무소 프로젝트 — 남은 작업 (TODO)

**마지막 업데이트:** 2026-07-04
**현재 상태:** P1 공개 사이트 코드 완료, `main`에 병합·push 완료, Netlify 레포 연결 + 자동배포 설정 완료.

---

## 1. P1 마무리 — 지금 사이트를 "진짜 오픈"하기 위해 필요한 것

- [ ] **실제 매물 6건 + 사진** → `supabase/seed.sql`을 실제 데이터로 교체
  - 사진은 Supabase **Storage**에 공개 버킷 만들어 업로드 → 공개 URL을 각 매물 `images` 배열에 채우기
  - 교체 후 Supabase SQL Editor에서 재실행 → Netlify에서 재배포(다음 push 시 자동 반영)
- [x] **OG 이미지**(카톡/검색 공유 미리보기용) → 기본값으로 `public/banner0.png` 사용. 다른 이미지를 원하면 같은 경로에 교체(권장 1200×630).
- [ ] **정식 도메인** 구매 시:
  - Netlify → Domain management에서 커스텀 도메인 연결(연결하면 자동배포에서 새 도메인이 canonical/OG/sitemap에 자동 반영됨)
  - `NEXT_PUBLIC_SITE_URL` 환경변수는 **선택** — 미설정 시 Netlify 기본 도메인을 자동 사용. 특정 URL로 고정하고 싶을 때만 이 변수로 덮어씀
- [ ] **검색엔진 등록** (도메인/URL이 안정된 뒤에 진행)
  - 네이버 서치어드바이저 (HTML 태그 방식) → 받은 코드를 `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` 환경변수에 (코드 수정 불필요)
  - 구글 서치콘솔 (HTML 태그 방식) → `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
  - 두 곳 다 `sitemap.xml` 제출 (자동 생성됨, 별도 작업 불필요)

### 사소한 정리 (급하지 않음)
- [ ] `README.md` — 아직 create-next-app 기본 문구(Vercel/pnpm 언급) 그대로 → 실제 프로젝트 설명으로 교체하거나 삭제
- [ ] `public/*.svg` (next.svg, vercel.svg, globe.svg 등) — 템플릿 기본 아이콘, 실제 미사용 → 삭제 가능

---

## 2. 다음 단계 — P2~P4 (설계 스펙엔 있으나 아직 상세 구현계획 없음)

`docs/superpowers/specs/2026-07-03-haengun-budongsan-website-design.md` 기준 로드맵. 각 단계는 P1처럼 별도 브랜치·구현계획으로 진행 예정.

### P2 — 어드민 (사장님 직접 매물 등록)
- 폰 홈화면 아이콘 설치 + 4자리 PIN 로그인 (장기 세션)
- 매물 등록/수정 화면 (사진 업로드 → 유형/거래 버튼 → 주소 자동완성 → AI 설명 생성 → 저장 시 즉시 반영)
- **문의 수신함** — 상담문의 요청폼 제출 처리 + 이메일 알림 (P1은 전화 모달까지만 구현, 폼 제출은 여기서)
- 데이터 리포트 `[지금 생성]` 버튼, `[네이버 블로그용 만들기]` 버튼(변형본+복사)

### P3 — 콘텐츠 허브 & 자동화
- "부동산 소식" 페이지 (가이드/리포트 목록 + 상세)
- 개발자가 개념 가이드 10~15개 1회 시딩
- 월 1회 자동 데이터 리포트 게시 (공공데이터 실거래가 → AI 정리, 무검수 안전형)

### P4 — 뉴스 위젯 & 마무리
- 네이버 뉴스 검색 API 링크아웃 위젯 (제목+요약만, 이미지 미복사)
- 사진 최적화 파이프라인 (업로드 시 WebP 변환·리사이즈)
- GTM 실행: 네이버 플레이스 등록·최적화, 구글 비즈니스 프로필, 거래 성사 시 리뷰 요청 루틴

---

## 3. 참고용 — 검토했지만 지금은 손 안 대도 되는 항목

최종 코드 리뷰에서 나왔던 사소한(Minor) 항목들. 지금 매물 규모·운영 방식에선 문제 없다고 판단해 보류.

- `formatPrice`: 1만원 미만 값은 "원" 단위 그대로 표시(만원 단위 아님) — 공장/토지 거래 특성상 실무 영향 없음
- `getFeaturedListings`: 전체 매물을 메모리에서 slice — 매물이 수백 건 이상으로 늘면 그때 DB 쿼리 단에서 제한하도록 개선
- `ShareButtons`의 복사 완료 알림이 `alert`/`prompt` — 나중에 조용한 토스트 UI로 바꾸면 사용성 개선(현재도 동작엔 문제 없음)

---

## 참고 문서
- 설계 스펙: `docs/superpowers/specs/2026-07-03-haengun-budongsan-website-design.md`
- P1 구현계획: `docs/superpowers/plans/2026-07-03-haengun-budongsan-phase1-public-site.md`
- 세팅/배포 가이드: `docs/SETUP.md`
