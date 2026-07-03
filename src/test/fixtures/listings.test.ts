import { describe, it, expect } from 'vitest';
import { sampleRows } from './listings';

describe('sampleRows fixture', () => {
  it('has a factory-sale, a land row, and a hidden row for filter/RLS tests', () => {
    expect(sampleRows.some(r => r.property_type === '공장' && r.deal_type === '매매')).toBe(true);
    expect(sampleRows.some(r => r.property_type === '토지')).toBe(true);
    expect(sampleRows.some(r => r.status === '비공개')).toBe(true);
  });

  it('every row carries the legally-required display fields', () => {
    for (const r of sampleRows) {
      expect(r.address.length).toBeGreaterThan(0);
      expect(typeof r.price).toBe('number');
      expect(['공장', '창고', '토지', '기타']).toContain(r.property_type);
      expect(['매매', '임대']).toContain(r.deal_type);
    }
  });
});
