export type PropertyType = '공장' | '창고' | '토지' | '기타';
export type DealType = '매매' | '임대';
export type ListingStatus = '공개' | '거래완료' | '비공개';

export interface ListingRow {
  id: string;
  slug: string;
  title: string;
  property_type: PropertyType;
  deal_type: DealType;
  status: ListingStatus;
  address: string;
  address_public: boolean;
  land_area_m2: number | null;
  building_area_m2: number | null;
  price: number;
  monthly_rent: number | null;
  zoning: string | null;
  land_category: string | null;
  road_access: string | null;
  ceiling_height_m: number | null;
  power_capacity: string | null;
  completion_year: number | null;
  lat: number | null;
  lng: number | null;
  images: string[];
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  slug: string;
  title: string;
  propertyType: PropertyType;
  dealType: DealType;
  status: ListingStatus;
  address: string;
  addressPublic: boolean;
  landAreaM2: number | null;
  buildingAreaM2: number | null;
  price: number;
  monthlyRent: number | null;
  zoning: string | null;
  landCategory: string | null;
  roadAccess: string | null;
  ceilingHeightM: number | null;
  powerCapacity: string | null;
  completionYear: number | null;
  lat: number | null;
  lng: number | null;
  images: string[];
  description: string | null;
  createdAt: string;
  updatedAt: string;
}
