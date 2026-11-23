// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSupabaseMock } from '@/test/supabaseMock';
import { getCurrentUser } from '@/services/getCurrentUser';

const supabase = createSupabaseMock();
let cookieList: { name: string }[] = [];

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => supabase.createClient(),
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => cookieList }),
}));

afterEach(() => {
  supabase.reset();
  cookieList = [];
});

describe('getCurrentUser', () => {
  it('returns null and builds no client with no cookies', async () => {
    await expect(getCurrentUser()).resolves.toBeNull();
    expect(supabase.createClient).not.toHaveBeenCalled();
  });

  it('returns null and builds no client with unrelated cookies only', async () => {
    cookieList = [{ name: 'theme' }, { name: 'sb-xyz-other' }];
    await expect(getCurrentUser()).resolves.toBeNull();
    expect(supabase.createClient).not.toHaveBeenCalled();
  });

  it('asks Supabase when the session cookie is present', async () => {
    cookieList = [{ name: 'sb-xyz-auth-token' }];
    await expect(getCurrentUser()).resolves.toEqual({ id: 'user-1' });
    expect(supabase.createClient).toHaveBeenCalledOnce();
  });

  it('asks Supabase when the session cookie is chunked', async () => {
    cookieList = [
      { name: 'sb-xyz-auth-token.0' },
      { name: 'sb-xyz-auth-token.1' },
    ];
    await expect(getCurrentUser()).resolves.toEqual({ id: 'user-1' });
    expect(supabase.createClient).toHaveBeenCalledOnce();
  });
});
