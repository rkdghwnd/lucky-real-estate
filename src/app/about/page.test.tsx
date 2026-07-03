import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from './page';
import { siteConfig } from '@/lib/site';

describe('AboutPage', () => {
  it('states the 25-year network positioning and the registration number', () => {
    render(<AboutPage />);
    expect(screen.getAllByText(/25년/).length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(siteConfig.registrationNumber))).toBeInTheDocument();
  });
});
