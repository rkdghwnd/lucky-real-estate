'use client';
import { useState } from 'react';
import { m2ToPyeong, pyeongToM2 } from '@/lib/format';

const round2 = (n: number) => (Math.round(n * 100) / 100).toString();

export function UnitConverter() {
  const [m2, setM2] = useState('');
  const [py, setPy] = useState('');

  const onM2 = (v: string) => {
    setM2(v);
    const n = parseFloat(v);
    setPy(v !== '' && Number.isFinite(n) ? round2(m2ToPyeong(n)) : '');
  };
  const onPy = (v: string) => {
    setPy(v);
    const n = parseFloat(v);
    setM2(v !== '' && Number.isFinite(n) ? round2(pyeongToM2(n)) : '');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-hairline bg-brand-light px-4 py-2.5 text-sm">
      <span className="font-semibold text-ink">면적 변환기</span>
      <label className="flex items-center gap-1">
        <input
          inputMode="decimal"
          aria-label="제곱미터"
          value={m2}
          onChange={e => onM2(e.target.value)}
          className="h-11 w-24 rounded-md border border-hairline bg-canvas px-2 text-right text-ink"
        />
        <span className="text-muted">㎡</span>
      </label>
      <span aria-hidden="true" className="px-1 text-muted">=</span>
      <label className="flex items-center gap-1">
        <input
          inputMode="decimal"
          aria-label="평"
          value={py}
          onChange={e => onPy(e.target.value)}
          className="h-11 w-24 rounded-md border border-hairline bg-canvas px-2 text-right text-ink"
        />
        <span className="text-muted">평</span>
      </label>
    </div>
  );
}
