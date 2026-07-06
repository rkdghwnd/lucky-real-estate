export const siteConfig = {
  name: '행운부동산공인중개사사무소',
  shortName: '행운부동산',
  representative: '강병구',
  registrationNumber: '121-05-95376',
  phone: '032-567-8770',
  phoneHref: 'tel:0325678770',
  address: '인천광역시 서구 원당대로246번길 3-1',
  businessHours: '평일 09:00~18:00',
  positioning: '인천 서구 공장·토지 전문 부동산',
  // NEXT_PUBLIC_SITE_URL 미지정 시 Netlify 빌드가 주입하는 기본 도메인(URL)을 사용한다.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? 'https://haengun.example.com',
  naverMapClientId: process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ?? '',
  naverSiteVerification: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION ?? '',
  googleSiteVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
} as const;
