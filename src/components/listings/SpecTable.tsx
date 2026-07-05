import type { Listing } from '@/lib/types';
import { formatArea, formatDealPrice } from '@/lib/format';

export function SpecTable({ listing: l }: { listing: Listing }) {
  const rows: [string, string | null][] = [
    ['종류', `${l.propertyType} · ${l.dealType}`],
    ['소재지', l.address],
    ['가격', formatDealPrice(l)],
    ['대지면적', l.landAreaM2 != null ? formatArea(l.landAreaM2) : null],
    ['건물면적', l.buildingAreaM2 != null ? formatArea(l.buildingAreaM2) : null],
    ['용도지역', l.zoning],
    ['지목', l.landCategory],
    ['도로', l.roadAccess],
    ['층고', l.ceilingHeightM != null ? `${l.ceilingHeightM}m` : null],
    ['전력', l.powerCapacity],
    ['준공연도', l.completionYear != null ? `${l.completionYear}년` : null],
  ];

  return (
    <dl className="grid grid-cols-1 overflow-hidden rounded-lg border border-hairline sm:grid-cols-2">
      {rows
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => (
          <div key={k} className="flex border-b border-hairline">
            <dt className="w-24 shrink-0 bg-brand-light px-4 py-3 text-sm font-semibold text-muted sm:w-28">{k}</dt>
            <dd className="flex-1 px-4 py-3 text-sm font-medium text-ink">{v}</dd>
          </div>
        ))}
    </dl>
  );
}
