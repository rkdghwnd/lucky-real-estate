import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShareButtons } from './ShareButtons';
import { siteConfig } from '@/lib/site';

describe('ShareButtons', () => {
  it('copies the canonical listing URL to the clipboard', () => {
    // Scope the stub to navigator.clipboard (do NOT replace navigator wholesale).
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    vi.stubGlobal('alert', vi.fn()); // jsdom has no window.alert
    render(<ShareButtons slug="factory-sale-01" title="공장" />);
    // writeText is invoked synchronously before the handler's await, so no await needed.
    fireEvent.click(screen.getByRole('button', { name: '링크복사' }));
    expect(writeText).toHaveBeenCalledWith(`${siteConfig.siteUrl}/listings/factory-sale-01`);
    vi.unstubAllGlobals();
  });
  it('offers an SMS link containing the URL', () => {
    render(<ShareButtons slug="factory-sale-01" title="공장" />);
    expect(screen.getByRole('link', { name: '문자' }).getAttribute('href')).toContain('factory-sale-01');
  });
});
