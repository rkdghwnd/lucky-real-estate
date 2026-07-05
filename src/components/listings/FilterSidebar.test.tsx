import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSidebar, type FilterState } from './FilterSidebar';

const base: FilterState = { propertyType: '전체', dealType: '전체', areaBucket: '전체', priceBucket: '전체' };

describe('FilterSidebar', () => {
  it('emits propertyType on 공장 click', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterSidebar state={base} resultCount={6} onChange={onChange} onReset={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: '공장' }));
    expect(onChange).toHaveBeenCalledWith({ propertyType: '공장' });
  });

  it('hides the price select when dealType is 전체', () => {
    render(<FilterSidebar state={base} resultCount={6} onChange={vi.fn()} onReset={vi.fn()} />);
    expect(screen.queryByLabelText('가격 구간')).toBeNull();
  });

  it('shows 매매 price buckets when dealType is 매매', () => {
    render(<FilterSidebar state={{ ...base, dealType: '매매' }} resultCount={6} onChange={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByLabelText('가격 구간')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '1억~2억' })).toBeInTheDocument();
  });

  it('emits reset', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(<FilterSidebar state={base} resultCount={6} onChange={vi.fn()} onReset={onReset} />);
    await user.click(screen.getByRole('button', { name: '초기화' }));
    expect(onReset).toHaveBeenCalled();
  });
});
