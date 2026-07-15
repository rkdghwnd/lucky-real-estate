import type { ListingRow } from '@/lib/types';

export const sampleRows: ListingRow[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'factory-sale-01', title: '오류동 제조공장',
    property_type: '공장', deal_type: '매매', status: '공개',
    address: '인천광역시 서구 오류동 000-0', address_public: true,
    land_area_m2: 1000, building_area_m2: 600, price: 1850000000, monthly_rent: null,
    zoning: '계획관리지역', land_category: '공장용지', road_access: '6m 도로 접함',
    ceiling_height_m: 8, power_capacity: '150kW', completion_year: 2015,
    lat: 37.57, lng: 126.665, images: ['https://x.supabase.co/a.jpg', 'https://x.supabase.co/b.jpg'],
    description: '설명', created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    slug: 'land-lease-01', title: '오류동 공장부지',
    property_type: '토지', deal_type: '임대', status: '공개',
    address: '인천광역시 서구 오류동 111-1', address_public: true,
    land_area_m2: 2000, building_area_m2: null, price: 300000000, monthly_rent: 5000000,
    zoning: '계획관리지역', land_category: '전', road_access: '6m 도로 접함',
    ceiling_height_m: null, power_capacity: null, completion_year: null,
    lat: 37.568, lng: 126.662, images: [],
    description: null, created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    slug: 'hidden-01', title: '비공개 창고',
    property_type: '창고', deal_type: '매매', status: '비공개',
    address: '인천광역시 서구 왕길동 222-2', address_public: false,
    land_area_m2: 1500, building_area_m2: 900, price: 900000000, monthly_rent: null,
    zoning: '일반공업지역', land_category: '창고용지', road_access: '8m 도로 접함',
    ceiling_height_m: 10, power_capacity: '100kW', completion_year: 2019,
    lat: 37.606, lng: 126.648, images: ['https://x.supabase.co/c.jpg'],
    description: '비공개', created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-01T00:00:00Z',
  },
];
