import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from './Footer';
import { siteConfig } from '@/lib/site';

describe('Footer', () => {
  it('shows the legally-required office fields', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>);
    expect(screen.getByText(new RegExp(siteConfig.registrationNumber))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(siteConfig.representative))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(siteConfig.address))).toBeInTheDocument();
  });
});
