import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AdminListingTable } from '@/components/admin/AdminListingTable';
import { Button } from '@/components/ui/button';
import { getAdminListings } from '@/lib/admin/listings';
import { getAdminDashboardNotice } from '@/lib/admin/notice';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string }>;
}) {
  const client = await createServerSupabaseClient();
  const listings = await getAdminListings(client);
  const notice = getAdminDashboardNotice(await searchParams);

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-brand">ADMIN</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">매물 관리</h1>
          <p className="mt-2 text-muted">매물을 등록하고 공개 상태를 관리합니다.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/listings/new"><Plus aria-hidden="true" /> 새 매물 등록</Link>
        </Button>
      </header>
      {notice ? (
        <p role="status" className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 font-bold text-brand">
          {notice}
        </p>
      ) : null}
      <AdminListingTable listings={listings} />
    </div>
  );
}
