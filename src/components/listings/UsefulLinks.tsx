'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const LINKS = [
  { name: '국토교통부', href: 'https://www.molit.go.kr', logo: '/logos/molit.png' },
  { name: '인터넷 등기소', href: 'https://www.iros.go.kr', logo: '/logos/iros.png' },
  { name: '국세청', href: 'https://www.nts.go.kr', logo: '/logos/nts.png' },
  { name: '정부24', href: 'https://www.gov.kr', logo: '/logos/gov24.png' },
  { name: 'LH한국토지주택공사', href: 'https://www.lh.or.kr', logo: '/logos/lh.png' },
  { name: 'SEE:REAL', href: 'https://seereal.lh.or.kr', logo: '/logos/seereal.png' },
] as const;

function LogoTile({ name, href, logo }: { name: string; href: string; logo: string }) {
  // Falls back to the org name if the logo image is missing, so the tile is never a broken image.
  const [failed, setFailed] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      className="flex min-h-16 items-center justify-center rounded-md border border-hairline bg-canvas p-3 transition hover:border-brand hover:bg-brand-light"
    >
      {failed ? (
        <span className="text-center text-xs font-semibold leading-tight text-ink">{name}</span>
      ) : (
        <span className="relative block h-8 w-full">
          <Image src={logo} alt={name} fill sizes="130px" className="object-contain" onError={() => setFailed(true)} />
        </span>
      )}
    </a>
  );
}

export function UsefulLinks() {
  return (
    <Card aria-label="부동산 유용 사이트">
      <CardHeader>
        <p className="text-sm font-bold text-ink">부동산 유용 사이트</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {LINKS.map(l => (
            <LogoTile key={l.href} name={l.name} href={l.href} logo={l.logo} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
