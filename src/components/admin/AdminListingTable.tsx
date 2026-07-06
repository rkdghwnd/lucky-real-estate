'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button, Modal, Tag } from 'antd';
import {
  deleteListingAction,
  setListingStatusAction,
  type AdminActionResult,
} from '@/app/admin/actions';
import type { AdminListing } from '@/lib/admin/listings';
import type { ListingStatus } from '@/lib/types';

type VisibleStatus = Extract<ListingStatus, '공개' | '거래완료'>;
type StatusAction = (id: string, status: VisibleStatus) => Promise<AdminActionResult<{ slug: string }>>;
type DeleteAction = (id: string) => Promise<AdminActionResult<{ slug: string }>>;

function formatPrice(listing: AdminListing) {
  const deposit = `${Math.round(listing.price / 10_000).toLocaleString('ko-KR')}만원`;
  if (listing.dealType === '임대' && listing.monthlyRent !== null) {
    return `${deposit} / 월 ${Math.round(listing.monthlyRent / 10_000).toLocaleString('ko-KR')}만원`;
  }
  return deposit;
}

function statusCopy(status: VisibleStatus) {
  return status === '공개'
    ? {
        next: '거래완료' as const,
        title: '거래완료로 변경',
        description: '공개 사이트에서 즉시 숨겨집니다. 거래완료로 변경할까요?',
        confirm: '거래완료로 변경',
      }
    : {
        next: '공개' as const,
        title: '다시 공개',
        description: '이 매물을 공개 사이트에 다시 표시할까요?',
        confirm: '다시 공개',
      };
}

export function AdminListingTable({
  listings,
  statusAction = setListingStatusAction,
  deleteAction = deleteListingAction,
}: {
  listings: AdminListing[];
  statusAction?: StatusAction;
  deleteAction?: DeleteAction;
}) {
  const router = useRouter();
  const [activeStatus, setActiveStatus] = useState<VisibleStatus>('공개');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<AdminListing | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<AdminListing | null>(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const counts = useMemo(() => ({
    공개: listings.filter(listing => listing.status === '공개').length,
    거래완료: listings.filter(listing => listing.status === '거래완료').length,
  }), [listings]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ko-KR');
    return listings.filter(listing => {
      if (listing.status !== activeStatus) return false;
      if (!normalized) return true;
      return `${listing.title} ${listing.address}`.toLocaleLowerCase('ko-KR').includes(normalized);
    });
  }, [activeStatus, listings, query]);

  async function changeStatus() {
    if (!selected) return;
    const copy = statusCopy(selected.status as VisibleStatus);
    setPending(true);
    setError('');
    const result = await statusAction(selected.id, copy.next);
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setNotice(copy.next === '거래완료'
      ? '거래완료로 변경했습니다. 공개 사이트에서는 숨겨집니다.'
      : '매물을 다시 공개했습니다.');
    setSelected(null);
    router.refresh();
  }

  async function removeListing() {
    if (!deleteTarget) return;
    setDeletePending(true);
    setDeleteError('');
    const result = await deleteAction(deleteTarget.id);
    setDeletePending(false);
    if (!result.ok) {
      setDeleteError(result.message);
      return;
    }
    setNotice('매물을 삭제했습니다.');
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <section className="space-y-5" aria-label="매물 목록">
      {notice ? <p role="status" className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 font-bold text-brand">{notice}</p> : null}
      <div className="flex flex-col gap-4 rounded-2xl border border-hairline bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2" aria-label="매물 상태">
          {(['공개', '거래완료'] as const).map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setActiveStatus(status)}
              aria-pressed={activeStatus === status}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeStatus === status ? 'bg-ink text-white' : 'bg-[#f3f5f8] text-muted hover:text-ink'
              }`}
            >
              {status === '공개' ? '공개 중' : '거래완료'} {counts[status]}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:max-w-sm">
          <span className="sr-only">매물 검색</span>
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            aria-label="매물 검색"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="매물명 또는 주소 검색"
            className="h-11 w-full rounded-xl border border-hairline bg-white pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="grid min-h-64 place-items-center px-6 text-center">
            <div>
              <p className="font-bold text-ink">검색 결과가 없습니다.</p>
              <p className="mt-1 text-sm text-muted">검색어를 바꾸거나 다른 상태를 선택해주세요.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] border-collapse text-left text-sm">
              <thead className="border-b border-hairline bg-[#f8f9fb] text-xs font-bold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-4">매물</th>
                  <th className="px-4 py-4">종류</th>
                  <th className="px-4 py-4">가격</th>
                  <th className="px-4 py-4">수정일</th>
                  <th className="px-5 py-4 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filtered.map(listing => {
                  const copy = statusCopy(listing.status as VisibleStatus);
                  return (
                    <tr key={listing.id} className="align-middle hover:bg-[#fafbfc]">
                      <td className="px-5 py-5">
                        <div className="flex max-w-md items-center gap-3">
                          <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#eef0f3] text-[11px] font-semibold text-muted">
                            {listing.images[0] ? (
                              // Managed and legacy image URLs are both supported in the admin preview.
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={listing.images[0]} alt={`${listing.title} 대표 사진`} className="size-full object-cover" />
                            ) : '사진 없음'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/admin/listings/${listing.id}/edit`}
                                aria-label={`${listing.title} 수정`}
                                className="truncate font-extrabold text-ink hover:text-brand hover:underline"
                              >
                                {listing.title}
                              </Link>
                              <Tag color={listing.status === '공개' ? 'blue' : undefined}>{listing.status}</Tag>
                            </div>
                            <p className="mt-1 truncate text-muted">{listing.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5 font-semibold text-ink">{listing.propertyType} · {listing.dealType}</td>
                      <td className="px-4 py-5 font-semibold text-ink">{formatPrice(listing)}</td>
                      <td className="px-4 py-5 text-muted">
                        {new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(listing.updatedAt))}
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button href={`/admin/listings/${listing.id}/edit`} size="large">수정</Button>
                          <Button
                            htmlType="button"
                            size="large"
                            aria-label={`${listing.title} ${listing.status === '공개' ? '거래완료 처리' : '다시 공개'}`}
                            onClick={() => {
                              setError('');
                              setSelected(listing);
                            }}
                          >
                            {copy.confirm}
                          </Button>
                          <Button
                            htmlType="button"
                            size="large"
                            danger
                            aria-label={`${listing.title} 삭제`}
                            onClick={() => {
                              setDeleteError('');
                              setDeleteTarget(listing);
                            }}
                          >
                            삭제
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={selected !== null}
        title={selected ? statusCopy(selected.status as VisibleStatus).title : undefined}
        onCancel={() => !pending && setSelected(null)}
        centered
        closable={!pending}
        maskClosable={!pending}
        footer={selected ? [
          <Button key="cancel" htmlType="button" onClick={() => setSelected(null)} disabled={pending}>취소</Button>,
          <Button key="confirm" type="primary" htmlType="button" onClick={changeStatus} disabled={pending} loading={pending}>
            {pending ? '변경 중…' : statusCopy(selected.status as VisibleStatus).confirm}
          </Button>,
        ] : null}
      >
        {selected ? (
          <>
            <p className="text-muted">{statusCopy(selected.status as VisibleStatus).description}</p>
            {error ? <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-danger">{error}</p> : null}
          </>
        ) : null}
      </Modal>

      <Modal
        open={deleteTarget !== null}
        title="매물 삭제"
        onCancel={() => !deletePending && setDeleteTarget(null)}
        centered
        closable={!deletePending}
        maskClosable={!deletePending}
        footer={deleteTarget ? [
          <Button key="cancel" htmlType="button" onClick={() => setDeleteTarget(null)} disabled={deletePending}>취소</Button>,
          <Button key="confirm" type="primary" danger htmlType="button" onClick={removeListing} disabled={deletePending} loading={deletePending}>
            {deletePending ? '삭제 중…' : '삭제'}
          </Button>,
        ] : null}
      >
        {deleteTarget ? (
          <>
            <p className="text-muted">
              <strong className="text-ink">{deleteTarget.title}</strong> 매물을 완전히 삭제합니다. 등록된 사진도 함께 지워지며 되돌릴 수 없습니다.
            </p>
            {deleteError ? <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-danger">{deleteError}</p> : null}
          </>
        ) : null}
      </Modal>
    </section>
  );
}
