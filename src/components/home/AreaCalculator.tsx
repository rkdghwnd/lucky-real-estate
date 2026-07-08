'use client';

import { useState } from 'react';
import { Card, InputNumber } from 'antd';

// 1평 = 400/121 ㎡ ≈ 3.305785㎡; 1㎡ = 121/400 평 = 0.3025평 (both exact).
const PYEONG_PER_M2 = 0.3025;
const M2_PER_PYEONG = 3.305785;
const round2 = (n: number) => Math.round(n * 100) / 100;

export function AreaCalculator() {
  const [m2, setM2] = useState<number | null>(null);
  const [pyeong, setPyeong] = useState<number | null>(null);

  const fromM2 = (v: number | null) => {
    setM2(v);
    setPyeong(v == null ? null : round2(v * PYEONG_PER_M2));
  };
  const fromPyeong = (v: number | null) => {
    setPyeong(v);
    setM2(v == null ? null : round2(v * M2_PER_PYEONG));
  };

  return (
    <Card styles={{ body: { padding: 20 } }} className="border border-hairline/80 shadow-sm rounded-2xl bg-canvas">
      <h3 className="mb-4 text-base font-extrabold text-ink">평수 계산기</h3>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-xs font-bold text-muted">
          제곱미터 (㎡)
          <InputNumber
            aria-label="제곱미터"
            value={m2}
            onChange={fromM2}
            min={0}
            size="large"
            className="w-full rounded-xl bg-surface border-0 focus:bg-canvas focus:ring-2 focus:ring-brand/20 transition-all"
            placeholder="0"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-muted">
          평
          <InputNumber
            aria-label="평"
            value={pyeong}
            onChange={fromPyeong}
            min={0}
            size="large"
            className="w-full rounded-xl bg-surface border-0 focus:bg-canvas focus:ring-2 focus:ring-brand/20 transition-all"
            placeholder="0"
          />
        </label>
        <p className="text-xs font-semibold text-muted/60 mt-1">1평 = 3.3058㎡ · 1㎡ = 0.3025평</p>
      </div>
    </Card>
  );
}
