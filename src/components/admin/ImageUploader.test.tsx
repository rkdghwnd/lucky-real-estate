import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, it, vi } from 'vitest';
import type { ListingImageItem } from '@/lib/admin/images';
import { ImageUploader } from './ImageUploader';

const createObjectURL = vi.fn((file: File) => `blob:${file.name}`);
const revokeObjectURL = vi.fn();

beforeEach(() => {
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
});

it('offers an accessible multi-file input and adds selected images', async () => {
  const onChange = vi.fn();
  render(<ImageUploader items={[]} onChange={onChange} />);
  const input = screen.getByLabelText('매물 사진 선택');
  expect(input).toHaveAttribute('type', 'file');
  expect(input).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
  expect(input).toHaveAttribute('multiple');

  const photo = new File(['photo'], 'factory.jpg', { type: 'image/jpeg' });
  await userEvent.upload(input, photo);
  expect(onChange).toHaveBeenCalledWith([
    expect.objectContaining({ file: photo, previewUrl: 'blob:factory.jpg' }),
  ]);
});

it('shows the over-limit message without changing the controlled list', async () => {
  const onChange = vi.fn();
  const current = Array.from({ length: 20 }, (_, index): ListingImageItem => ({
    id: String(index),
    path: `listing/image-${index}.webp`,
    previewUrl: `/image-${index}.webp`,
  }));
  render(<ImageUploader items={current} onChange={onChange} />);

  await userEvent.upload(
    screen.getByLabelText('매물 사진 선택'),
    new File(['photo'], 'extra.jpg', { type: 'image/jpeg' }),
  );
  expect(screen.getByRole('alert')).toHaveTextContent('최대 20장');
  expect(onChange).not.toHaveBeenCalled();
});

it('marks the first image as representative, reorders, and removes images', async () => {
  const onChange = vi.fn();
  const items: ListingImageItem[] = [
    { id: 'a', path: 'listing/a.webp', previewUrl: '/a.webp' },
    { id: 'b', path: 'listing/b.webp', previewUrl: '/b.webp' },
  ];
  const { rerender } = render(<ImageUploader items={items} onChange={onChange} />);

  expect(screen.getByText('대표 사진')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '2번 사진을 왼쪽으로 이동' }));
  expect(onChange).toHaveBeenLastCalledWith([items[1], items[0]]);

  rerender(<ImageUploader items={items} onChange={onChange} />);
  await userEvent.click(screen.getByRole('button', { name: '1번 사진 삭제' }));
  expect(onChange).toHaveBeenLastCalledWith([items[1]]);
});

it('shows upload status and revokes a pending preview when removed', async () => {
  const pending: ListingImageItem = {
    id: 'pending',
    file: new File(['x'], 'pending.jpg', { type: 'image/jpeg' }),
    previewUrl: 'blob:pending.jpg',
  };
  const onChange = vi.fn();
  render(<ImageUploader items={[pending]} onChange={onChange} statuses={{ pending: 'uploading' }} />);

  expect(screen.getByText('업로드 중…')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: '1번 사진 삭제' }));
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:pending.jpg');
  expect(onChange).toHaveBeenCalledWith([]);
});
