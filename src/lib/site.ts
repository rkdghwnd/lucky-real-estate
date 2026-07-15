export const siteConfig = {
  name: '행운부동산공인중개사사무소',
  shortName: '행운부동산',
  representative: '강병구',
  registrationNumber: '121-05-95376',
  phone: '010-9014-6448',
  phoneHref: 'tel:01090146448',
  landline: '032-567-8770',
  address: '인천광역시 서구 원당대로246번길 3-1',
  businessHours: '평일 09:00~18:00',
  positioning: '인천 서구 공장·토지 전문 부동산',
  // Injected at build time (Vite). Set VITE_SITE_URL to the real domain in CI.
  siteUrl: import.meta.env.VITE_SITE_URL ?? 'https://haengun.example.com',
  naverMapClientId: import.meta.env.VITE_NAVER_MAP_CLIENT_ID ?? '',
  naverSiteVerification: import.meta.env.VITE_NAVER_SITE_VERIFICATION ?? '',
  googleSiteVerification: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION ?? '',
} as const;
