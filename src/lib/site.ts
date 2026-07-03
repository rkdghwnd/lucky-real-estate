export const siteConfig = {
  name: '행운부동산공인중개사사무소',
  shortName: '행운부동산',
  representative: '<대표자명>',
  registrationNumber: '<중개등록번호>',
  phone: '<사무소 전화번호>',
  phoneHref: 'tel:<숫자만-예: 0320000000>',
  address: '인천광역시 서구 오류동 <상세주소>',
  businessHours: '평일 09:00–18:00',
  positioning: '인천 서구 공장·토지, 25년 네트워크. 네이버에 없는 물건까지 연결합니다.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://haengun.example.com',
  naverMapClientId: process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? '',
} as const;
