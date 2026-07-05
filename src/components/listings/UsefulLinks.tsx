import { ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const LINKS = [
  { name: '국토교통부', href: 'https://www.molit.go.kr' },
  { name: '인터넷 등기소', href: 'https://www.iros.go.kr' },
  { name: '국세청', href: 'https://www.nts.go.kr' },
  { name: '정부24', href: 'https://www.gov.kr' },
  { name: 'LH한국토지주택공사', href: 'https://www.lh.or.kr' },
  { name: 'SEE:REAL', href: 'https://seereal.lh.or.kr' },
] as const;

export function UsefulLinks() {
  return (
    <Card aria-label="부동산 유용 사이트">
      <CardHeader>
        <p className="text-sm font-bold text-ink">부동산 유용 사이트</p>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-hairline">
          {LINKS.map(l => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center justify-between gap-2 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-brand-light hover:text-brand"
              >
                <span>{l.name}</span>
                <ExternalLink aria-hidden="true" className="size-4 shrink-0 text-muted" />
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
