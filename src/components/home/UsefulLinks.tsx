import Image from 'next/image';
import { Card } from 'antd';

// Official Korean real-estate / government reference sites — identity taken from each
// logo under /public/logos.
const LINKS = [
  { name: '국토교통부', logo: '/logos/molit.svg', url: 'https://www.molit.go.kr' },
  { name: '인터넷등기소', logo: '/logos/iros.png', url: 'https://www.iros.go.kr' },
  { name: '국세청', logo: '/logos/nts.png', url: 'https://www.nts.go.kr' },
  { name: '정부24', logo: '/logos/gov24.svg', url: 'https://www.gov.kr' },
  { name: 'LH공사', logo: '/logos/lh.svg', url: 'https://www.lh.or.kr' },
  { name: '씨:리얼', logo: '/logos/seereal.svg', url: 'https://seereal.lh.or.kr' },
] as const;

export function UsefulLinks() {
  return (
    <Card size="small" title="부동산 정보 사이트">
      <div className="grid grid-cols-2 gap-2">
        {LINKS.map(link => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 rounded-lg border border-hairline p-3 text-center transition hover:border-brand hover:bg-brand-light/50"
          >
            <span className="flex h-8 w-full items-center justify-center">
              <Image
                src={link.logo}
                alt={link.name}
                width={120}
                height={32}
                className="h-8 w-full object-contain"
                unoptimized
              />
            </span>
            <span className="text-[0.72rem] font-medium leading-tight text-muted">{link.name}</span>
          </a>
        ))}
      </div>
    </Card>
  );
}
