import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BannerCarousel } from './BannerCarousel';

describe('BannerCarousel', () => {
  it('renders all four banner images', () => {
    render(<BannerCarousel />);
    expect(screen.getByAltText('행운부동산 배너 1')).toBeInTheDocument();
    expect(screen.getByAltText('행운부동산 배너 4')).toBeInTheDocument();
  });

  it('has four navigation dots with the first active', () => {
    render(<BannerCarousel />);
    const dots = screen.getAllByRole('button', { name: /배너 \d 보기/ });
    expect(dots).toHaveLength(4);
    expect(dots[0]).toHaveAttribute('aria-current', 'true');
  });

  it('advances to the next banner on 다음 배너 click', async () => {
    const user = userEvent.setup();
    render(<BannerCarousel />);
    await user.click(screen.getByRole('button', { name: '다음 배너' }));
    expect(screen.getByRole('button', { name: '배너 2 보기' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('button', { name: '배너 1 보기' })).not.toHaveAttribute('aria-current');
  });

  it('links the active banner to the office Naver place in a new tab', () => {
    render(<BannerCarousel />);
    const link = screen.getByRole('link', { name: /네이버 지도에서 보기/ });
    expect(link.getAttribute('href')).toContain('map.naver.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
