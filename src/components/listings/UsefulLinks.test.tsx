import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsefulLinks } from './UsefulLinks';

const CASES: [string, string][] = [
  ['국토교통부', 'molit.go.kr'],
  ['인터넷 등기소', 'iros.go.kr'],
  ['국세청', 'nts.go.kr'],
  ['정부24', 'gov.kr'],
  ['LH한국토지주택공사', 'lh.or.kr'],
  ['SEE:REAL', 'seereal.lh.or.kr'],
];

describe('UsefulLinks', () => {
  it('renders each useful real-estate site as an external link in a new tab', () => {
    render(<UsefulLinks />);
    for (const [name, host] of CASES) {
      const link = screen.getByRole('link', { name });
      expect(link.getAttribute('href')).toContain(host);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
  });
});
