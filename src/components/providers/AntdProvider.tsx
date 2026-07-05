'use client';

import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';

// Noto Sans KR is the site-wide default font (loaded via next/font in the layout, exposed as
// the CSS var below). Feed it to antd's fontFamily token so antd components match the custom
// (Tailwind) sections. Everything else stays antd's default theme.
const FONT_FAMILY =
  "var(--font-noto-sans-kr), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";

/**
 * Client-side Ant Design context. antd's default theme (per request) — only the fontFamily
 * token is overridden (to Noto Sans KR) — plus the Korean locale so built-in strings
 * (Pagination, Empty, etc.) render in 한국어. Style extraction / cascade-layer wrapping is
 * handled by <AntdRegistry layer> in the layout.
 */
export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={koKR} theme={{ token: { fontFamily: FONT_FAMILY } }}>
      {children}
    </ConfigProvider>
  );
}
