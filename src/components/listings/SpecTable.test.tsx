import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpecTable } from './SpecTable';
import { rowToListing } from '@/lib/listings';
import { sampleRows } from '@/test/fixtures/listings';

describe('SpecTable', () => {
  it('renders required fields and omits empty ones', () => {
    render(<SpecTable listing={rowToListing(sampleRows[1])} />); // 토지, no 층고/전력
    expect(screen.getByText('소재지')).toBeInTheDocument();
    expect(screen.getByText('가격')).toBeInTheDocument();
    expect(screen.queryByText('층고')).toBeNull();
    expect(screen.queryByText('전력')).toBeNull();
  });
});
