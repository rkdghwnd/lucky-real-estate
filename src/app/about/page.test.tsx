import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from './page';
import { siteConfig } from '@/lib/site';

describe('AboutPage', () => {
  it('shows the office address and registration number', () => {
    render(<AboutPage />);
    expect(screen.getAllByText(siteConfig.address).length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(siteConfig.registrationNumber))).toBeInTheDocument();
  });
});
