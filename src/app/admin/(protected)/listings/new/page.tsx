import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ListingForm } from '@/components/admin/ListingForm';

export default function NewListingPage() {
  return (
    <div className="space-y-7">
      <header>
        <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-bold text-muted hover:text-brand">
          <ArrowLeft aria-hidden="true" className="size-4" /> 매물 목록
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-ink">새 매물 등록</h1>
        <p className="mt-2 text-muted">필수 정보를 입력하고 저장하면 사이트에 바로 공개됩니다.</p>
      </header>
      <ListingForm mode="create" />
    </div>
  );
}
