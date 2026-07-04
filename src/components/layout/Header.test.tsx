import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from './Header';
import { siteConfig } from '@/lib/site';

describe('Header', () => {
  it('exposes the office phone as a tel: link and the primary nav routes', () => {
    render(<Header />);
    const phoneLinks = screen.getAllByRole('link', { name: new RegExp(siteConfig.phone) });
    expect(phoneLinks.some(a => a.getAttribute('href') === siteConfig.phoneHref)).toBe(true);
    expect(screen.getByRole('link', { name: '매물검색' })).toHaveAttribute('href', '/listings');
    expect(screen.getByRole('link', { name: '회사소개' })).toHaveAttribute('href', '/about');
  });

  it('toggles the mobile menu open and closed', async () => {
    const user = userEvent.setup();
    render(<Header />);
    expect(screen.queryByRole('navigation', { name: '모바일 메뉴' })).toBeNull();
    await user.click(screen.getByRole('button', { name: '메뉴' }));
    expect(screen.getByRole('navigation', { name: '모바일 메뉴' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '메뉴 닫기' }));
    expect(screen.queryByRole('navigation', { name: '모바일 메뉴' })).toBeNull();
  });
});
