import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from 'antd';
import { AdminListingTable } from '@/components/admin/AdminListingTable';
import { useAdminListings } from '@/lib/admin/queries';
import { getAdminDashboardNotice } from '@/lib/admin/notice';

export function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const { data: listings = [], isLoading, isError } = useAdminListings();
  const notice = getAdminDashboardNotice({
    created: searchParams.get('created') ?? undefined,
    updated: searchParams.get('updated') ?? undefined,
  });

  useEffect(() => {
    document.title = '매물 관리';
  }, []);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand">ADMIN</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">매물 관리</h1>
          <p className="mt-2 text-muted">매물을 등록하고 공개 상태를 관리합니다.</p>
        </div>
        <Link to="/admin/listings/new">
          <Button type="primary" size="large" icon={<Plus aria-hidden="true" />}>새 매물 등록</Button>
        </Link>
      </header>
      {notice ? (
        <p role="status" className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 font-bold text-brand">{notice}</p>
      ) : null}
      {isError ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-danger">매물을 불러오지 못했습니다.</p>
      ) : isLoading ? (
        <div className="grid min-h-64 place-items-center text-muted">불러오는 중…</div>
      ) : (
        <AdminListingTable listings={listings} />
      )}
    </div>
  );
}
