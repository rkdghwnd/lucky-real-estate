import { expect, it } from 'vitest';
import { getAdminDashboardNotice } from './notice';

it('maps successful form redirects to plain-language confirmation', () => {
  expect(getAdminDashboardNotice({ created: '1' })).toBe('매물이 공개되었습니다.');
  expect(getAdminDashboardNotice({ updated: '1' })).toBe('수정 내용이 공개 사이트에 반영되었습니다.');
  expect(getAdminDashboardNotice({ created: '0' })).toBeNull();
});
