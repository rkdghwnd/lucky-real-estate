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
    ['준공', l.completionYear != null ? `${l.completionYear}년` : null],
  ];
  return (
    <table className="w-full overflow-hidden rounded-3xl border border-hairline bg-canvas text-lg">
      <tbody>
        {rows.filter(([, v]) => v != null && v !== '').map(([k, v]) => (
          <tr key={k} className="border-b border-hairline last:border-b-0">
            <th scope="row" className="w-28 bg-brand-light py-3 px-5 text-left align-top font-semibold text-muted">{k}</th>
            <td className="py-3 px-5 text-ink">{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
