import { useEffect } from 'react';
import { ListingForm } from '@/components/admin/ListingForm';

export function AdminListingNew() {
  useEffect(() => {
    document.title = '새 매물 등록';
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black tracking-tight text-ink">새 매물 등록</h1>
      <ListingForm mode="create" />
    </div>
  );
}
