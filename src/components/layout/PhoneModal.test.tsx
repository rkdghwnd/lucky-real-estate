import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneModalTrigger } from './PhoneModal';
import { siteConfig } from '@/lib/site';

describe('PhoneModalTrigger', () => {
  it('opens a dialog with a tel: link when clicked, then closes', async () => {
    const user = userEvent.setup();
    render(<PhoneModalTrigger label="전화문의" />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.click(screen.getByRole('button', { name: '전화문의' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: new RegExp(siteConfig.phone) })).toHaveAttribute('href', siteConfig.phoneHref);
    await user.click(screen.getByRole('button', { name: '닫기' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
