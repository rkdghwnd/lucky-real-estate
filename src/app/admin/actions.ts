'use server';

import { z } from 'zod';
import { getAdminAccess } from '@/lib/admin/auth';
import {
  createAdminListing,
  setAdminListingStatus,
  updateAdminListing,
} from '@/lib/admin/listings';
import { listingPayloadSchema } from '@/lib/admin/listing-schema';
import { revalidateListingPaths } from '@/lib/admin/revalidate';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export type AdminActionResult<T = undefined> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: 'VALIDATION' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'STORAGE' | 'DATABASE';
      message: string;
      fieldErrors?: Record<string, string>;
    };

function validationErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    fields[key] ??= issue.message;
  }
  return fields;
}

async function adminClient() {
  const client = await createServerSupabaseClient();
  const access = await getAdminAccess(client);
  return access ? client : null;
}

export async function loginAction(formData: FormData): Promise<AdminActionResult<{ email: string }>> {
  const credentials = z.object({
    email: z.string().trim().email(),
    password: z.string().min(1),
  }).safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!credentials.success) {
    return { ok: false, code: 'VALIDATION', message: '아이디와 비밀번호를 입력해주세요.' };
  }

  const client = await createServerSupabaseClient();
  const { error } = await client.auth.signInWithPassword(credentials.data);
  if (error) return { ok: false, code: 'UNAUTHORIZED', message: '아이디 또는 비밀번호를 확인해주세요.' };

  const access = await getAdminAccess(client);
  if (!access) {
    await client.auth.signOut();
    return { ok: false, code: 'UNAUTHORIZED', message: '관리자 권한이 없는 계정입니다.' };
  }
  return { ok: true, data: { email: access.email } };
}

export async function logoutAction(): Promise<AdminActionResult> {
  const client = await createServerSupabaseClient();
  await client.auth.signOut();
  return { ok: true, data: undefined };
}

export async function requestPasswordResetAction(formData: FormData): Promise<AdminActionResult> {
  const email = z.string().trim().email().safeParse(formData.get('email'));
  if (!email.success) return { ok: false, code: 'VALIDATION', message: '아이디(이메일)를 확인해주세요.' };

  const client = await createServerSupabaseClient();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const { error } = await client.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${siteUrl}/admin/auth/callback?next=/admin/reset-password`,
  });
  if (error) return { ok: false, code: 'DATABASE', message: '비밀번호 재설정 메일을 보내지 못했습니다.' };
  return { ok: true, data: undefined };
}

export async function updatePasswordAction(formData: FormData): Promise<AdminActionResult> {
  const parsed = z.object({
    password: z.string().min(10, '비밀번호는 10자 이상 입력해주세요.'),
    confirmPassword: z.string(),
  }).refine(value => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: '비밀번호가 서로 다릅니다.',
  }).safeParse({ password: formData.get('password'), confirmPassword: formData.get('confirmPassword') });
  if (!parsed.success) {
    return { ok: false, code: 'VALIDATION', message: parsed.error.issues[0]?.message ?? '비밀번호를 확인해주세요.' };
  }

  const client = await createServerSupabaseClient();
  const { error } = await client.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false, code: 'DATABASE', message: '비밀번호를 변경하지 못했습니다.' };
  return { ok: true, data: undefined };
}

export async function createListingAction(input: unknown): Promise<AdminActionResult<{ id: string; slug: string }>> {
  const client = await adminClient();
  if (!client) return { ok: false, code: 'UNAUTHORIZED', message: '로그인이 만료되었습니다. 다시 로그인해주세요.' };

  const parsed = listingPayloadSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      code: 'VALIDATION',
      message: '표시된 입력 항목을 확인해주세요.',
      fieldErrors: validationErrors(parsed.error),
    };
  }

  try {
    const listing = await createAdminListing(client, parsed.data);
    revalidateListingPaths(listing.slug);
    return { ok: true, data: { id: listing.id, slug: listing.slug } };
  } catch {
    return { ok: false, code: 'DATABASE', message: '매물을 저장하지 못했습니다. 다시 시도해주세요.' };
  }
}

export async function updateListingAction(
  id: string,
  input: unknown,
): Promise<AdminActionResult<{ id: string; slug: string }>> {
  const client = await adminClient();
  if (!client) return { ok: false, code: 'UNAUTHORIZED', message: '로그인이 만료되었습니다. 다시 로그인해주세요.' };

  const parsed = listingPayloadSchema.safeParse(input);
  if (!parsed.success || parsed.data.id !== id) {
    return {
      ok: false,
      code: 'VALIDATION',
      message: '표시된 입력 항목을 확인해주세요.',
      fieldErrors: parsed.success ? { id: '매물 ID가 일치하지 않습니다.' } : validationErrors(parsed.error),
    };
  }

  try {
    const listing = await updateAdminListing(client, id, parsed.data);
    revalidateListingPaths(listing.slug);
    return { ok: true, data: { id: listing.id, slug: listing.slug } };
  } catch {
    return { ok: false, code: 'DATABASE', message: '매물을 수정하지 못했습니다. 다시 시도해주세요.' };
  }
}

const statusSchema = z.enum(['공개', '거래완료']);

export async function setListingStatusAction(
  id: string,
  status: '공개' | '거래완료',
): Promise<AdminActionResult<{ slug: string }>> {
  const client = await adminClient();
  if (!client) return { ok: false, code: 'UNAUTHORIZED', message: '로그인이 만료되었습니다. 다시 로그인해주세요.' };

  const parsed = z.object({ id: z.string().uuid(), status: statusSchema }).safeParse({ id, status });
  if (!parsed.success) return { ok: false, code: 'VALIDATION', message: '매물 상태 요청이 올바르지 않습니다.' };

  try {
    const listing = await setAdminListingStatus(client, parsed.data.id, parsed.data.status);
    revalidateListingPaths(listing.slug);
    return { ok: true, data: listing };
  } catch {
    return { ok: false, code: 'DATABASE', message: '매물 상태를 변경하지 못했습니다.' };
  }
}
