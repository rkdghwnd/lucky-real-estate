import { describe, it, expect } from 'vitest';
import { formatPrice, formatArea, pyeong, formatDealPrice, m2ToPyeong, pyeongToM2 } from './format';

describe('formatPrice', () => {
  it('formats 억 and 만원', () => {
    expect(formatPrice(350_000_000)).toBe('3억 5,000만원');
    expect(formatPrice(12_000_000)).toBe('1,200만원');
    expect(formatPrice(100_000_000)).toBe('1억원');
  });
  it('handles zero/invalid as 가격문의', () => {
    expect(formatPrice(0)).toBe('가격문의');
    expect(formatPrice(-5)).toBe('가격문의');
  });
});

describe('formatArea / pyeong', () => {
  it('converts ㎡ to 평 and formats', () => {
    expect(pyeong(1000)).toBe(303);
    expect(formatArea(1000)).toBe('1,000㎡ (약 303평)');
  });
  it('returns dash for null', () => {
    expect(formatArea(null)).toBe('-');
  });
});

describe('formatDealPrice', () => {
  it('labels 매매', () => {
    expect(formatDealPrice({ dealType: '매매', price: 1_850_000_000, monthlyRent: null })).toBe('매매 18억 5,000만원');
  });
  it('labels 임대 with deposit and monthly rent', () => {
    expect(formatDealPrice({ dealType: '임대', price: 300_000_000, monthlyRent: 9_000_000 })).toBe('임대 보증금 3억원 / 월 900만원');
  });
});

describe('area conversion', () => {
  it('converts m2 to pyeong', () => {
    expect(m2ToPyeong(3.305785)).toBeCloseTo(1, 3);
  });
  it('converts pyeong to m2', () => {
    expect(pyeongToM2(1)).toBeCloseTo(3.305785, 3);
  });
});
