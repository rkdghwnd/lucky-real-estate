import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi, type MockInstance } from 'vitest';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AdminListing } from '@/lib/admin/listings';

vi.mock('@/lib/admin/api', () => ({ deleteListingAction: vi.fn() }));

import { AdminListingTable } from './AdminListingTable';

let invalidateSpy: MockInstance;

// AdminListingTable needs a Router (Link/useNavigate) and a QueryClient
// (invalidateQueries refreshes the list after a delete).
function renderTable(ui: ReactElement) {
  const queryClient = new QueryClient();
  invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

const listings: AdminListing[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    slug: 'factory-sale-01',
    title: '오류동 제조공장',
    propertyType: '공장',
    dealType: '매매',
    status: '공개',
    address: '인천광역시 서구 오류동 10',
    addressPublic: true,
    landAreaM2: 1000,
    buildingAreaM2: 600,
    price: 1_850_000_000,
    monthlyRent: null,
    zoning: '계획관리지역',
    landCategory: '공장용지',
    roadAccess: '6m 도로',
    ceilingHeightM: 8,
    powerCapacity: '150kW',
    completionYear: 2015,
    lat: 37.57,
    lng: 126.665,
    images: ['https://example.com/factory.jpg'],
    imagePaths: ['listing-id/factory.webp'],
    description: '설명',
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-02T00:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    slug: 'warehouse-complete-01',
    title: '왕길동 대형창고',
    propertyType: '창고',
    dealType: '임대',
    status: '거래완료',
    address: '인천광역시 서구 왕길동 20',
    addressPublic: true,
    landAreaM2: 2000,
    buildingAreaM2: 1200,
    price: 100_000_000,
    monthlyRent: 5_000_000,
    zoning: null,
    landCategory: null,
    roadAccess: null,
    ceilingHeightM: null,
    powerCapacity: null,
    completionYear: null,
    lat: null,
    lng: null,
    images: [],
    imagePaths: [],
    description: null,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-03T00:00:00Z',
  },
];

beforeEach(() => vi.clearAllMocks());

it('shows status counts, searches title/address, and links to editing', async () => {
  renderTable(<AdminListingTable listings={listings} />);

  expect(screen.getByRole('button', { name: '공개 중 1' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '거래완료 1' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '오류동 제조공장 수정' })).toHaveAttribute(
    'href',
    '/admin/listings/11111111-1111-1111-1111-111111111111/edit',
  );
  expect(screen.getByRole('img', { name: '오류동 제조공장 대표 사진' })).toHaveAttribute(
    'src',
    'https://example.com/factory.jpg',
  );

  const search = screen.getByRole('searchbox', { name: '매물 검색' });
  await userEvent.type(search, '왕길동');
  expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: '거래완료 1' }));
  expect(screen.getByText('왕길동 대형창고')).toBeInTheDocument();
});

it('confirms a delete, performs it, and refreshes the dashboard', async () => {
  const action = vi.fn(async () => ({ ok: true as const, data: { slug: 'factory-sale-01' } }));
  renderTable(<AdminListingTable listings={listings} deleteAction={action} />);

  await userEvent.click(screen.getByRole('button', { name: '오류동 제조공장 삭제' }));
  const dialog = screen.getByRole('dialog');
  expect(within(dialog).getByText(/완전히 삭제/)).toBeInTheDocument();
  await userEvent.click(within(dialog).getByRole('button', { name: '삭제' }));

  await waitFor(() => expect(action).toHaveBeenCalledWith(listings[0].id));
  expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['adminListings'] });
  expect(screen.getByRole('status')).toHaveTextContent('매물을 삭제했습니다.');
});

it('keeps the delete dialog open and reports a failed delete', async () => {
  const action = vi.fn(async () => ({
    ok: false as const,
    code: 'DATABASE' as const,
    message: '삭제에 실패했습니다.',
  }));
  renderTable(<AdminListingTable listings={listings} deleteAction={action} />);

  await userEvent.click(screen.getByRole('button', { name: '오류동 제조공장 삭제' }));
  const dialog = screen.getByRole('dialog');
  await userEvent.click(within(dialog).getByRole('button', { name: '삭제' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('삭제에 실패했습니다.');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(invalidateSpy).not.toHaveBeenCalled();
});
