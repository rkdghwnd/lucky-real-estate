import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const adminSources = [
  'src/app/admin/layout.tsx',
  'src/app/admin/(auth)/login/page.tsx',
  'src/app/admin/(auth)/forgot-password/page.tsx',
  'src/app/admin/(auth)/reset-password/page.tsx',
  'src/components/admin/ListingForm.tsx',
].map(path => readFileSync(path, 'utf8')).join('\n');

describe('admin visual accessibility contract', () => {
  it('uses dynamic viewport minimums and readable placeholder contrast', () => {
    expect(adminSources).not.toContain('min-h-screen');
    expect(adminSources).not.toContain('placeholder:text-muted/60');
    expect(adminSources).toContain('min-h-[100dvh]');
    expect(adminSources).toContain('placeholder:text-muted');
  });

  it('keeps generated interface copy free of decorative long dashes', () => {
    expect(adminSources).not.toMatch(/[—–]/);
  });
});
