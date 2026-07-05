import { describe, expect, it } from 'vitest';
import { getAdminAccess } from './auth';

function fakeClient(options: { claims?: Record<string, unknown>; claimsError?: boolean; allowed?: boolean; rpcError?: boolean }) {
  return {
    auth: {
      getClaims: async () => ({
        data: options.claims ? { claims: options.claims } : null,
        error: options.claimsError ? { message: 'invalid token' } : null,
      }),
    },
    rpc: async () => ({
      data: options.allowed ?? false,
      error: options.rpcError ? { message: 'rpc failed' } : null,
    }),
  };
}

describe('getAdminAccess', () => {
  it('returns the verified admin identity', async () => {
    const client = fakeClient({ claims: { sub: 'u1', email: 'admin@example.com' }, allowed: true });
    await expect(getAdminAccess(client as never)).resolves.toEqual({ userId: 'u1', email: 'admin@example.com' });
  });

  it('rejects a valid user outside the allowlist', async () => {
    const client = fakeClient({ claims: { sub: 'u2', email: 'other@example.com' }, allowed: false });
    await expect(getAdminAccess(client as never)).resolves.toBeNull();
  });

  it('rejects missing or invalid claims', async () => {
    await expect(getAdminAccess(fakeClient({ claimsError: true, allowed: true }) as never)).resolves.toBeNull();
    await expect(getAdminAccess(fakeClient({ claims: { email: 'admin@example.com' }, allowed: true }) as never)).resolves.toBeNull();
  });

  it('rejects an allowlist lookup error', async () => {
    const client = fakeClient({ claims: { sub: 'u1' }, allowed: true, rpcError: true });
    await expect(getAdminAccess(client as never)).resolves.toBeNull();
  });
});
