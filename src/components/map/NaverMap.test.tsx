import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NaverMap } from './NaverMap';

// siteConfig.naverMapClientId is '' in the test env → fallback branch.
describe('NaverMap (no key)', () => {
  it('renders a Naver map search link with the address', () => {
    render(<NaverMap lat={37.5} lng={126.6} address="인천 서구 오류동 000" />);
    const link = screen.getByRole('link', { name: /네이버 지도에서 위치 보기/ });
    expect(link.getAttribute('href')).toContain(encodeURIComponent('인천 서구 오류동 000'));
  });
});
