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
    <Card styles={{ body: { padding: 20 } }} className="border border-hairline/80 shadow-sm rounded-2xl bg-canvas">
      <h3 className="mb-4 text-base font-extrabold text-ink">부동산 정보 사이트</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {LINKS.map(link => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-2 rounded-xl border border-hairline/80 p-3 text-center bg-canvas transition-all duration-200 hover:border-brand/40 hover:bg-brand-light/20 hover:-translate-y-0.5"
          >
            <span className="flex h-8 w-full items-center justify-center">
              <img
                src={link.logo}
                alt={link.name}
                width={120}
                height={32}
                className="h-8 w-full object-contain filter grayscale opacity-75 hover:grayscale-0 hover:opacity-100 transition-all"
              />
            </span>
          </a>
        ))}
      </div>
    </Card>
  );
}
