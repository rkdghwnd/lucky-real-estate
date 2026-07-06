'use client';

import { ConfigProvider, type ThemeConfig } from 'antd';
import koKR from 'antd/locale/ko_KR';

const FONT_FAMILY =
  "var(--font-noto-sans-kr), -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";

/**
 * Thin token layer over Ant Design (see DESIGN.md). antd stays the component system, but the
 * framework-default look is elevated: a larger, more readable base type size (better for the
 * elderly operator's clients), a softer single radius scale, and neutrals unified with the
 * custom (Tailwind) sections so the whole surface reads as one designed system, not stock antd.
 * The accent is locked to one blue. Korean locale keeps built-in strings (Pagination, Empty…) 한국어.
 */
const theme: ThemeConfig = {
  token: {
    fontFamily: FONT_FAMILY,
    colorPrimary: '#1677ff',
    colorLink: '#1677ff',
    fontSize: 16,
    borderRadius: 8,
    colorText: '#0a0b0d',
    colorTextSecondary: '#5b616e',
    colorBorder: '#dee1e6',
    colorBorderSecondary: '#eef0f3',
    colorBgLayout: '#f7f8fa',
  },
  components: {
    Card: { borderRadiusLG: 12 },
    Button: { fontWeight: 600 },
  },
};

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={koKR} theme={theme}>
      {children}
    </ConfigProvider>
  );
}
