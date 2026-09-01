# 행운부동산공인중개사사무소

인천 서구 공장·창고·토지 전문 부동산 중개 웹사이트. Vite + React 19 SPA, Supabase(데이터·이미지·관리자 인증), Tailwind CSS v4, antd v6 기반.

## 개발

```bash
npm install
npm run dev        # 개발 서버
npm test           # vitest
npm run lint       # eslint
```

환경변수는 `.env.local`에 설정합니다(필수값은 `.env.local.example` 참고).

## GitHub Pages 배포

저장소는 GitHub Actions로 자동 배포됩니다(`.github/workflows/deploy.yml`).

**최초 1회 설정:**

1. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 변경합니다.
2. **Settings → Secrets and variables → Actions**에 빌드용 시크릿을 등록합니다(필수 항목만):
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Supabase 공개 클라이언트 값
   - `VITE_SITE_URL` — `https://<사용자명>.github.io/lucky-real-estate/`
   - `VITE_NAVER_MAP_CLIENT_ID` 등 나머지 `VITE_*` — 선택
3. `main`에 push하면 빌드 후 GitHub Pages에 배포됩니다.

**동작 방식:**

- 앱은 `<사용자명>.github.io/lucky-real-estate/` 하위 경로에서 서빙되므로 Vite `base`가 `/lucky-real-estate/`로 설정되어 있습니다(커스텀 도메인 사용 시 `VITE_BASE_PATH=/`로 오버라이드).
- GitHub Pages에는 서버 사이드 SPA fallback이 없으므로, 빌드 시 `index.html`을 `404.html`로 복사해 딥링크(`/listings/...` 직접 접속)를 처리합니다. React Router는 `basename: import.meta.env.BASE_URL`로 라우트를 매칭합니다.
- Jekyll 처리를 막기 위해 `.nojekyll` 파일이 함께 생성됩니다.

