import Link from 'next/link';
import { Breadcrumb as AntBreadcrumb } from 'antd';

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <AntBreadcrumb
      items={items.map(it => ({
        title: it.href ? <Link href={it.href}>{it.label}</Link> : it.label,
      }))}
    />
  );
}
