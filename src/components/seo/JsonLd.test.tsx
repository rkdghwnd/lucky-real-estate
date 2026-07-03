import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { JsonLd } from './JsonLd';

describe('JsonLd', () => {
  it('escapes "<" so embedded </script> cannot break out of the tag', () => {
    const { container } = render(<JsonLd data={{ name: 'evil</script><script>alert(1)</script>' }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const html = script!.innerHTML;
    expect(html).not.toContain('</script>');
    expect(html).toContain('\\u003c');
  });

  it('still emits valid JSON that parses back to the original data', () => {
    const data = { '@type': 'RealEstateAgent', name: '행운부동산' };
    const { container } = render(<JsonLd data={data} />);
    const html = container.querySelector('script')!.innerHTML;
    // Reverse the "<" escaping, then JSON.parse must round-trip.
    expect(JSON.parse(html.replace(/\\u003c/g, '<'))).toEqual(data);
  });
});
