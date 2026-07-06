'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ChevronLeft, ChevronRight, ImagePlus, Trash2 } from 'lucide-react';
import { Button } from 'antd';
import {
  isPendingListingImage,
  validateImageFiles,
  type ListingImageItem,
} from '@/lib/admin/images';

type UploadStatus = 'uploading' | 'done' | 'failed';

export function ImageUploader({
  items,
  onChange,
  errors = [],
  statuses = {},
  disabled = false,
}: {
  items: ListingImageItem[];
  onChange: (items: ListingImageItem[]) => void;
  errors?: string[];
  statuses?: Record<string, UploadStatus>;
  disabled?: boolean;
}) {
  const [selectionError, setSelectionError] = useState('');
  const createdUrls = useRef(new Set<string>());

  useEffect(() => () => {
    createdUrls.current.forEach(url => URL.revokeObjectURL(url));
    createdUrls.current.clear();
  }, []);

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    const error = validateImageFiles(files, items.length);
    if (error) {
      setSelectionError(error);
      return;
    }
    setSelectionError('');
    const additions: ListingImageItem[] = files.map(file => {
      const previewUrl = URL.createObjectURL(file);
      createdUrls.current.add(previewUrl);
      return { id: globalThis.crypto.randomUUID(), file, previewUrl };
    });
    onChange([...items, ...additions]);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    const item = items[index];
    if (isPendingListingImage(item) && item.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(item.previewUrl);
      createdUrls.current.delete(item.previewUrl);
    }
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  }

  const allErrors = [selectionError, ...errors].filter(Boolean);
  const hasUploadProgress = Object.keys(statuses).length > 0;
  const completedCount = items.filter(item => (
    !isPendingListingImage(item) || statuses[item.id] === 'done'
  )).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-bold text-ink">사진 <span className="text-danger">*</span></p>
          <p className="mt-1 text-sm text-muted">첫 번째 사진이 대표 사진입니다. 최대 20장, 원본 한 장당 20MB</p>
          {hasUploadProgress ? (
            <p role="status" aria-label="사진 업로드 진행률" className="mt-1 text-sm font-bold text-brand">
              {completedCount}/{items.length}장 완료
            </p>
          ) : null}
        </div>
        <label className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white transition hover:bg-black/80 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
          <ImagePlus aria-hidden="true" className="size-5" /> 사진 추가
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            aria-label="매물 사진 선택"
            className="sr-only"
            onChange={selectFiles}
            disabled={disabled}
          />
        </label>
      </div>

      {allErrors.length > 0 ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-danger">
          {allErrors.map(error => <p key={error}>{error}</p>)}
        </div>
      ) : null}

      {items.length === 0 ? (
        <label className={`grid min-h-48 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-hairline bg-[#fafbfc] text-center transition hover:border-brand ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
          <span>
            <ImagePlus aria-hidden="true" className="mx-auto size-8 text-muted" />
            <span className="mt-3 block font-bold text-ink">사진을 선택해주세요</span>
            <span className="mt-1 block text-sm text-muted">JPG · PNG · WebP</span>
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            aria-label="빈 영역에서 매물 사진 선택"
            className="sr-only"
            onChange={selectFiles}
            disabled={disabled}
          />
        </label>
      ) : (
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => {
            const status = statuses[item.id];
            return (
              <li key={item.id} className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-[#eef0f3]">
                  {/* Blob previews and legacy external URLs are both valid here. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt={`${index + 1}번 매물 사진`} className="size-full object-cover" />
                  {index === 0 ? <span className="absolute left-2 top-2 rounded-md bg-brand px-2.5 py-1 text-xs font-extrabold text-white">대표 사진</span> : null}
                  {status ? (
                    <span className={`absolute inset-x-2 bottom-2 rounded-md px-2.5 py-1 text-center text-xs font-bold ${
                      status === 'failed' ? 'bg-red-600 text-white' : 'bg-black/75 text-white'
                    }`}>
                      {status === 'uploading' ? '업로드 중…' : status === 'done' ? '업로드 완료' : '업로드 실패'}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-1 p-2">
                  <div className="flex gap-1">
                    <Button
                      htmlType="button"
                      size="middle"
                      type="text"
                      aria-label={`${index + 1}번 사진을 왼쪽으로 이동`}
                      onClick={() => move(index, -1)}
                      disabled={disabled || index === 0}
                      icon={<ChevronLeft aria-hidden="true" className="size-5" />}
                    />
                    <Button
                      htmlType="button"
                      size="middle"
                      type="text"
                      aria-label={`${index + 1}번 사진을 오른쪽으로 이동`}
                      onClick={() => move(index, 1)}
                      disabled={disabled || index === items.length - 1}
                      icon={<ChevronRight aria-hidden="true" className="size-5" />}
                    />
                  </div>
                  <Button
                    htmlType="button"
                    size="middle"
                    type="text"
                    danger
                    aria-label={`${index + 1}번 사진 삭제`}
                    onClick={() => remove(index)}
                    disabled={disabled}
                    icon={<Trash2 aria-hidden="true" className="size-5" />}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
