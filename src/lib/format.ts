import type { Listing } from './types';

const PYEONG_PER_M2 = 3.305785;

export function formatPrice(won: number): string {
  if (!Number.isFinite(won) || won <= 0) return '가격문의';
  const eok = Math.floor(won / 100_000_000);
  const man = Math.floor((won % 100_000_000) / 10_000);
  const parts: string[] = [];
  if (eok > 0) parts.push(`${eok}억`);
  if (man > 0) parts.push(`${man.toLocaleString('ko-KR')}만`);
  return parts.length ? `${parts.join(' ')}원` : `${won.toLocaleString('ko-KR')}원`;
}

export function pyeong(m2: number): number {
  return Math.round(m2 / PYEONG_PER_M2);
}

export function m2ToPyeong(m2: number): number {
  return m2 / PYEONG_PER_M2;
}

export function pyeongToM2(p: number): number {
  return p * PYEONG_PER_M2;
}

export function formatArea(m2: number | null | undefined): string {
  if (m2 == null || !Number.isFinite(m2) || m2 <= 0) return '-';
  return `${m2.toLocaleString('ko-KR')}㎡ (약 ${pyeong(m2).toLocaleString('ko-KR')}평)`;
}

export function formatListingNo(l: Pick<Listing, 'id' | 'slug'>): string {
  const source = `${l.slug}${l.id}`;
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) >>> 0;
  }
  return `No.${(hash % 90000) + 10000}`;
}

export function formatDealPrice(l: Pick<Listing, 'dealType' | 'price' | 'monthlyRent'>): string {
  if (l.dealType === '임대') {
    const deposit = `임대 보증금 ${formatPrice(l.price)}`;
    return l.monthlyRent && l.monthlyRent > 0 ? `${deposit} / 월 ${formatPrice(l.monthlyRent)}` : deposit;
  }
  return `매매 ${formatPrice(l.price)}`;
}
