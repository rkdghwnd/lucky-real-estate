import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted">
      {items.map((it, i) => (
        <span key={it.label} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3.5 text-hairline" aria-hidden="true" />}
          {it.href ? (
            <Link href={it.href} className="transition hover:text-brand">{it.label}</Link>
          ) : (
            <span className="font-semibold text-ink">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
