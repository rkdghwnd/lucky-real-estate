'use client';

import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';

/**
 * Client-side Ant Design context. Uses antd's default theme (per request) and
 * the Korean locale so built-in strings (Pagination, Empty, etc.) render in 한국어.
 * Style extraction / cascade-layer wrapping is handled by <AntdRegistry layer> in the layout.
 */
export function AntdProvider({ children }: { children: React.ReactNode }) {
  return <ConfigProvider locale={koKR}>{children}</ConfigProvider>;
}
