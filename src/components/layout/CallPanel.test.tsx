import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CallPanel } from './CallPanel';
import { siteConfig } from '@/lib/site';

describe('CallPanel', () => {
  it('shows the office phone as a tel: link and a link to the listings page', () => {
    render(<CallPanel />);
    expect(screen.getByRole('link', { name: new RegExp(siteConfig.phone) })).toHaveAttribute('href', siteConfig.phoneHref);
    expect(screen.getByRole('link', { name: '매물 보기' })).toHaveAttribute('href', '/listings');
  });
});
