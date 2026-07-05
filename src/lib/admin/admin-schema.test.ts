import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migrationPath = 'supabase/migrations/20260706010000_admin_listing_management.sql';

describe('admin listing migration', () => {
  const migration = readFileSync(migrationPath, 'utf8');

  it('enforces one admin and does not grant listing delete', () => {
    expect(migration).toContain('singleton boolean primary key');
    expect(migration).toContain('create or replace function public.is_admin()');
    expect(migration).toContain('create policy "admin inserts listings"');
    expect(migration).toContain('create policy "admin updates listings"');
    expect(migration).not.toContain('create policy "admin deletes listings"');
  });

  it('protects the listing image bucket', () => {
    expect(migration).toContain("'listing-images'");
    expect(migration).toContain('on storage.objects for insert');
    expect(migration).toContain('on storage.objects for delete');
    expect(migration).toContain('(select public.is_admin())');
  });

  it('updates timestamps and limits statuses', () => {
    expect(migration).toContain("status in ('공개','거래완료')");
    expect(migration).toContain('set_updated_at');
  });

  it('drops the legacy status constraint before converting 비공개 rows', () => {
    const dropConstraint = migration.indexOf('drop constraint if exists listings_status_check');
    const convertRows = migration.indexOf("update public.listings set status = '거래완료'");
    expect(dropConstraint).toBeGreaterThan(-1);
    expect(convertRows).toBeGreaterThan(-1);
    expect(dropConstraint).toBeLessThan(convertRows);
  });
});
