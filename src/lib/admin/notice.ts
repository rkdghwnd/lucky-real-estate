export function getAdminDashboardNotice(searchParams: { created?: string; updated?: string }): string | null {
  if (searchParams.created === '1') return '매물이 공개되었습니다.';
  if (searchParams.updated === '1') return '수정 내용이 공개 사이트에 반영되었습니다.';
  return null;
}
