import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel } from './FilterPanel';

describe('FilterPanel', () => {
  it('calls onPropertyTypeChange with the clicked type', async () => {
    const user = userEvent.setup();
    const onPropertyTypeChange = vi.fn();
    render(
      <FilterPanel propertyType="전체" dealType="전체" onPropertyTypeChange={onPropertyTypeChange} onDealTypeChange={vi.fn()} resultCount={6} />,
    );
    await user.click(screen.getByRole('button', { name: '공장' }));
    expect(onPropertyTypeChange).toHaveBeenCalledWith('공장');
  });

  it('calls onDealTypeChange with the clicked type', async () => {
    const user = userEvent.setup();
    const onDealTypeChange = vi.fn();
    render(
      <FilterPanel propertyType="전체" dealType="전체" onPropertyTypeChange={vi.fn()} onDealTypeChange={onDealTypeChange} resultCount={6} />,
    );
    await user.click(screen.getByRole('button', { name: '임대' }));
    expect(onDealTypeChange).toHaveBeenCalledWith('임대');
  });

  it('marks the active property and deal type as pressed, others as not', () => {
    render(<FilterPanel propertyType="창고" dealType="매매" onPropertyTypeChange={vi.fn()} onDealTypeChange={vi.fn()} resultCount={2} />);
    expect(screen.getByRole('button', { name: '창고' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '매매' })).toHaveAttribute('aria-pressed', 'true');
    for (const button of screen.getAllByRole('button', { name: '전체' })) {
      expect(button).toHaveAttribute('aria-pressed', 'false');
    }
  });
});
