import type { SupabaseClient } from '@supabase/supabase-js';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import type { AdminActionResult } from '@/app/admin/actions';
import type { ListingPayload } from '@/lib/admin/listing-schema';
import type { ListingImageItem, StoredListingImage } from '@/lib/admin/images';

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
vi.mock('@/app/admin/actions', () => ({
  createListingAction: vi.fn(),
  updateListingAction: vi.fn(),
}));
vi.mock('@/components/map/NaverMap', () => ({
  NaverMap: ({ address }: { address: string }) => <div data-testid="map-preview">{address}</div>,
}));

import { ListingForm, type ListingFormInitialValues } from './ListingForm';

const client = {} as SupabaseClient;
const success: AdminActionResult<{ id: string; slug: string }> = {
  ok: true,
  data: { id: '123e4567-e89b-12d3-a456-426614174000', slug: 'listing-20260706-123e45' },
};

const validValues: ListingFormInitialValues = {
  title: '오류동 제조공장',
  propertyType: '공장',
  dealType: '매매',
  address: '인천광역시 서구 오류동 10',
  priceManwon: '185000',
  monthlyRentManwon: '',
  landAreaM2: '1653',
  buildingAreaM2: '992',
  zoning: '계획관리지역',
  landCategory: '공장용지',
  roadAccess: '6m 도로 접함',
  ceilingHeightM: '8',
  powerCapacity: '150kW',
  completionYear: '2015',
  lat: null,
  lng: null,
  description: '진입이 편리한 제조 공장입니다.',
};

const existingImage: StoredListingImage = {
  id: 'stored-a',
  path: '123e4567/a.webp',
  previewUrl: 'https://example.com/a.webp',
};

function dependencies(overrides: Partial<React.ComponentProps<typeof ListingForm>> = {}) {
  return {
    getClient: () => client,
    uploadImages: vi.fn(async (_client: SupabaseClient, _id: string, items: ListingImageItem[]) => ({
      paths: items.map((item, index) => 'path' in item ? item.path : `123e4567/new-${index}.webp`),
      uploadedPaths: items.filter(item => 'file' in item).map((_, index) => `123e4567/new-${index}.webp`),
    })),
    cleanupImages: vi.fn(async () => undefined),
    createAction: vi.fn(async () => success),
    updateAction: vi.fn(async () => success),
    ...overrides,
  };
}

beforeEach(() => {
  router.replace.mockReset();
  router.refresh.mockReset();
  router.push.mockReset();
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:photo') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
});

it('shows sale pricing and live won/area previews', async () => {
  render(<ListingForm mode="create" {...dependencies()} />);

  expect(screen.getByLabelText('매매가(만원)')).toBeInTheDocument();
  expect(screen.queryByLabelText('월세(만원)')).not.toBeInTheDocument();
  await userEvent.type(screen.getByLabelText('매매가(만원)'), '185000');
  expect(screen.getByText('1,850,000,000원')).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText('대지면적(㎡)'), '1653');
  expect(screen.getByText(/약 500\.0평/)).toBeInTheDocument();
});

it('shows rental fields and rejects a blank monthly rent', async () => {
  const deps = dependencies();
  render(<ListingForm mode="create" initialValues={{ ...validValues, dealType: '임대', monthlyRentManwon: '' }} initialImages={[existingImage]} {...deps} />);

  expect(screen.getByLabelText('보증금(만원)')).toBeInTheDocument();
  expect(screen.getByLabelText('월세(만원)')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '저장하고 바로 공개' }));

  expect(await screen.findByText('월세를 입력해주세요.')).toBeInTheDocument();
  expect(deps.createAction).not.toHaveBeenCalled();
});

it('focuses and labels the first invalid field when required data is missing', async () => {
  render(<ListingForm mode="create" {...dependencies()} />);
  await userEvent.click(screen.getByRole('button', { name: '저장하고 바로 공개' }));

  const title = screen.getByLabelText('매물 제목');
  await waitFor(() => expect(title).toHaveFocus());
  expect(screen.getByText('매물 제목을 2자 이상 입력해주세요.')).toBeInTheDocument();
  expect(screen.getByText('사진을 한 장 이상 등록해주세요.')).toBeInTheDocument();
});

it('uploads a selected image and passes its managed path to create', async () => {
  const createAction = vi.fn(async (_input: unknown) => success);
  const deps = dependencies({ createAction });
  render(<ListingForm mode="create" initialValues={validValues} {...deps} />);
  await userEvent.upload(
    screen.getByLabelText('매물 사진 선택'),
    new File(['photo'], 'factory.jpg', { type: 'image/jpeg' }),
  );
  await userEvent.click(screen.getByRole('button', { name: '저장하고 바로 공개' }));

  await waitFor(() => expect(createAction).toHaveBeenCalledOnce());
  const payload = createAction.mock.calls[0][0] as ListingPayload;
  expect(payload.images).toEqual(['123e4567/new-0.webp']);
  expect(payload.price).toBe(1_850_000_000);
  expect(router.replace).toHaveBeenCalledWith('/admin?created=1');
});

it('cleans newly uploaded paths after a create failure and preserves values', async () => {
  const createAction = vi.fn(async (_input: unknown) => ({ ok: false as const, code: 'DATABASE' as const, message: '저장 실패' }));
  const cleanupImages = vi.fn(async () => undefined);
  const deps = dependencies({
    createAction,
    cleanupImages,
  });
  render(<ListingForm mode="create" initialValues={validValues} {...deps} />);
  await userEvent.upload(
    screen.getByLabelText('매물 사진 선택'),
    new File(['photo'], 'factory.jpg', { type: 'image/jpeg' }),
  );
  await userEvent.click(screen.getByRole('button', { name: '저장하고 바로 공개' }));

  expect(await screen.findByRole('alert', { name: '저장 오류' })).toHaveTextContent('저장 실패');
  expect(cleanupImages).toHaveBeenCalledWith(client, ['123e4567/new-0.webp']);
  expect(screen.getByLabelText('매물 제목')).toHaveValue(validValues.title);
});

it('saves edited image order and removes deleted stored objects only after database success', async () => {
  const second: StoredListingImage = {
    id: 'stored-b',
    path: '123e4567/b.webp',
    previewUrl: 'https://example.com/b.webp',
  };
  const updateAction = vi.fn(async (_id: string, _input: unknown) => success);
  const cleanupImages = vi.fn(async () => undefined);
  const deps = dependencies({ updateAction, cleanupImages });
  render(
    <ListingForm
      mode="edit"
      listingId="123e4567-e89b-12d3-a456-426614174000"
      initialValues={validValues}
      initialImages={[existingImage, second]}
      {...deps}
    />,
  );

  await userEvent.click(screen.getByRole('button', { name: '1번 사진 삭제' }));
  await userEvent.click(screen.getByRole('button', { name: '수정 내용 저장' }));

  await waitFor(() => expect(updateAction).toHaveBeenCalledOnce());
  const payload = updateAction.mock.calls[0][1] as ListingPayload;
  expect(payload.images).toEqual([second.path]);
  expect(cleanupImages).toHaveBeenCalledWith(client, [existingImage.path]);
  expect(router.replace).toHaveBeenCalledWith('/admin?updated=1');
});

it('disables cancel and save while submission is pending', async () => {
  let finishUpload!: (value: { paths: string[]; uploadedPaths: string[] }) => void;
  const uploadImages = vi.fn(() => new Promise<{ paths: string[]; uploadedPaths: string[] }>(resolve => {
    finishUpload = resolve;
  }));
  const deps = dependencies({ uploadImages });
  render(<ListingForm mode="create" initialValues={validValues} initialImages={[existingImage]} {...deps} />);

  await userEvent.click(screen.getByRole('button', { name: '저장하고 바로 공개' }));
  expect(screen.getByRole('button', { name: '목록으로 취소' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '사진 처리 중…' })).toBeDisabled();

  finishUpload({ paths: [existingImage.path], uploadedPaths: [] });
  await waitFor(() => expect(deps.createAction).toHaveBeenCalledOnce());
});
