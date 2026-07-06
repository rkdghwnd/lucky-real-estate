import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import type { Listing } from '@/lib/types';
import { FeaturedListings } from './FeaturedListings';

const listing: Listing = {
  id: 'l1',
  slug: 'seogu-oryu-factory-01',
  title: '오류동 제조공장',
  propertyType: '공장',
  dealType: '매매',
  status: '공개',
  address: '인천광역시 서구 오류동 10',
  landAreaM2: 1000,
  buildingAreaM2: 600,
  price: 1_850_000_000,
  monthlyRent: null,
  zoning: null,
  landCategory: null,
  roadAccess: null,
  ceilingHeightM: null,
  powerCapacity: null,
  completionYear: null,
  lat: null,
  lng: null,
  images: [],
  description: null,
  createdAt: '2026-06-01T00:00:00Z',
  updatedAt: '2026-06-02T00:00:00Z',
};

it('shows an empty message and hides 더보기 when there are no listings', () => {
  render(<FeaturedListings listings={[]} />);
  expect(screen.getByText('현재 등록된 매물이 없습니다.')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /더보기/ })).not.toBeInTheDocument();
});

it('renders cards and the 더보기 link when there are listings', () => {
  render(<FeaturedListings listings={[listing]} />);
  expect(screen.queryByText('현재 등록된 매물이 없습니다.')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /더보기/ })).toHaveAttribute('href', '/listings');
  expect(screen.getByRole('link', { name: '오류동 제조공장 상세보기' })).toBeInTheDocument();
});
