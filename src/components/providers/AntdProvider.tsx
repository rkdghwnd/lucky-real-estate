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
    colorPrimary: '#3182f6',
    colorLink: '#3182f6',
    fontSize: 16,
    borderRadius: 12,
    colorText: '#191f28',
    colorTextSecondary: '#4e5968',
    colorBorder: '#e5e8eb',
    colorBorderSecondary: '#f2f4f6',
    colorBgLayout: '#f2f4f6',
  },
  components: {
    Card: { borderRadiusLG: 18 },
    Button: { fontWeight: 600, controlHeightLG: 48, borderRadiusLG: 12 },
    Input: { controlHeightLG: 48, borderRadiusLG: 12 },
    Select: { controlHeightLG: 48, borderRadiusLG: 12 },
    InputNumber: { controlHeightLG: 48, borderRadiusLG: 12 },
  },
};

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={koKR} theme={theme}>
      {children}
    </ConfigProvider>
  );
}
