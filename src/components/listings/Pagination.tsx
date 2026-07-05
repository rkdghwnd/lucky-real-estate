'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const btn = 'grid h-10 min-w-10 place-items-center rounded-md border px-2 text-sm font-semibold transition disabled:opacity-40';

  return (
    <nav className="flex items-center justify-center gap-1.5" aria-label="페이지 이동">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="이전 페이지"
        className={`${btn} border-hairline text-muted hover:border-brand hover:text-brand`}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </button>
      {pages.map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={`${btn} ${p === page ? 'border-brand bg-brand text-white' : 'border-hairline text-ink hover:border-brand hover:text-brand'}`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="다음 페이지"
        className={`${btn} border-hairline text-muted hover:border-brand hover:text-brand`}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
