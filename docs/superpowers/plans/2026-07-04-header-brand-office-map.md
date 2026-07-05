# Header Brand and Office Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task, then superpowers:compound-engineering after review. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply `#1254CC` to the complete header and render one geocoded NAVER office marker on the home and company introduction pages.

**Architecture:** Keep the existing global `brand` color token and switch only the header surfaces from `navy` to `brand`. Extend `NaverMap` so latitude/longitude still render directly while address-only calls NAVER's Geocoder submodule, then reuse that component in the home map region and the existing company page.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, NAVER Maps JavaScript API v3, Vitest, Testing Library

---

### Task 1: Apply the Brand Token to the Header

**Files:**
- Modify: `src/components/layout/Header.test.tsx`
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Write the failing header color test**

Add a test that renders `Header`, expects the banner to contain `bg-brand`, opens the mobile menu, and expects that navigation to contain `bg-brand`.

```tsx
it('uses the primary brand color across desktop and mobile header surfaces', async () => {
  const user = userEvent.setup();
  render(<Header />);

  expect(screen.getByRole('banner')).toHaveClass('bg-brand');
  await user.click(screen.getByRole('button', { name: '메뉴' }));
  expect(screen.getByRole('navigation', { name: '모바일 메뉴' })).toHaveClass('bg-brand');
});
```

- [ ] **Step 2: Verify the test fails**

Run: `npx vitest run src/components/layout/Header.test.tsx`

Expected: FAIL because both elements still contain `bg-navy`.

- [ ] **Step 3: Implement the minimal header change**

Change the top-level header and expanded mobile navigation from `bg-navy` to `bg-brand`. Keep all remaining classes unchanged.

- [ ] **Step 4: Verify the focused test passes**

Run: `npx vitest run src/components/layout/Header.test.tsx`

Expected: all Header tests PASS.

### Task 2: Add Address Geocoding and One Office Marker

**Files:**
- Modify: `src/components/map/NaverMap.test.tsx`
- Modify: `src/components/map/NaverMap.tsx`

- [ ] **Step 1: Write failing address-mode tests**

Replace the old external-link expectation with tests for these contracts:

```tsx
it('shows an inline map error instead of an external link when the key is missing', () => {
  render(<NaverMap lat={null} lng={null} address="인천광역시 서구 원당대로246번길 3-1" />);
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.getByText('지도를 불러오지 못했습니다')).toBeInTheDocument();
});

it('geocodes an address and creates one marker', async () => {
  Object.defineProperty(siteConfig, 'naverMapClientId', { configurable: true, value: 'test-client-id' });
  const FakeMap = vi.fn(function FakeMap() {});
  const FakeMarker = vi.fn(function FakeMarker() {});
  const FakeLatLng = vi.fn(function FakeLatLng(lat: number, lng: number) { return { lat, lng }; });
  const fakeGeocode = vi.fn((_: unknown, callback: (status: string, response: unknown) => void) => {
    callback('OK', { v2: { addresses: [{ x: '126.675', y: '37.597' }] } });
  });
  Object.defineProperty(window, 'naver', {
    configurable: true,
    value: {
      maps: {
        LatLng: FakeLatLng,
        Map: FakeMap,
        Marker: FakeMarker,
        Service: { geocode: fakeGeocode, Status: { OK: 'OK' } },
      },
    },
  });

  render(<NaverMap lat={null} lng={null} address="인천광역시 서구 원당대로246번길 3-1" />);
  await waitFor(() => expect(fakeGeocode).toHaveBeenCalledWith(
    { query: '인천광역시 서구 원당대로246번길 3-1' },
    expect.any(Function),
  ));
  expect(FakeMap).toHaveBeenCalledTimes(1);
  expect(FakeMarker).toHaveBeenCalledTimes(1);
});
```

Add a focused assertion that a newly created SDK script URL contains `submodules=geocoder`.

- [ ] **Step 2: Verify the map tests fail**

Run: `npx vitest run src/components/map/NaverMap.test.tsx`

Expected: FAIL because address-only mode renders an external link and does not geocode.

- [ ] **Step 3: Implement geocoded address mode**

Update the local NAVER API interfaces to include `Service.geocode`, `Service.Status.OK`, and the `v2.addresses` response. Load:

```ts
script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${siteConfig.naverMapClientId}&submodules=geocoder`;
```

When coordinates are present, initialize as before. When coordinates are absent, call:

```ts
maps.Service.geocode({ query: address }, (status, response) => {
  const result = response?.v2.addresses[0];
  if (status !== maps.Service.Status.OK || !result) {
    setStatus('error');
    return;
  }
  createMap(Number(result.y), Number(result.x));
});
```

Create one `Marker` in `createMap`. Render a stable `min-h-[360px]` map surface while loading, and an address plus `지도를 불러오지 못했습니다` without a link on error.

- [ ] **Step 4: Verify the focused map tests pass**

Run: `npx vitest run src/components/map/NaverMap.test.tsx`

Expected: all NaverMap tests PASS.

### Task 3: Reuse the Office Map on Both Pages

**Files:**
- Modify: `src/app/page.tsx`
- Verify: `src/app/about/page.tsx`

- [ ] **Step 1: Replace the home listing map**

Replace `ListingsMap` with `NaverMap` and render:

```tsx
<NaverMap lat={null} lng={null} address={siteConfig.address} />
```

Keep the existing home map wrapper and call panel layout. Confirm the company page already passes the same props.

- [ ] **Step 2: Run integration checks**

Run: `npm test -- --run`

Expected: all test files PASS.

- [ ] **Step 3: Run static verification**

Run: `npm run lint`

Expected: zero errors.

Run: `npm run build`

Expected: Next.js production build completes and all routes prerender.

### Task 4: Browser Verification

**Files:** none

- [ ] **Step 1: Start or reuse the local dev server**

Run: `npm run dev -- --hostname 127.0.0.1 --port 3000`

- [ ] **Step 2: Verify desktop and mobile**

Check `/` and `/about` at desktop and mobile widths. Confirm the header uses `#1254CC`, both map areas render NAVER tiles, each has one office marker, no external map link appears, and there is no horizontal overflow.

If NAVER displays an authentication failure, verify the Maps application has Dynamic Map and Geocoding enabled and registers `http://localhost` plus the deployment host without ports or paths.

- [ ] **Step 3: Verify failure handling**

Use the automated missing-key test as the deterministic failure check. Do not expose or remove the real local key during browser verification.
