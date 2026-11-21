// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import type { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/cron/keep-alive/route';
import { argsOf, createSupabaseMock } from '@/test/supabaseMock';

const admin = createSupabaseMock();

vi.mock('@/lib/supabase/admin', () => ({
  adminSupabase: { from: (table: string) => admin.client.from(table) },
}));

afterEach(() => {
  admin.reset();
  vi.unstubAllEnvs();
});

function request(authorization?: string) {
  return new Request('https://midnightframe.app/api/cron/keep-alive', {
    headers: authorization ? { authorization } : {},
  }) as unknown as NextRequest;
}

describe('GET /api/cron/keep-alive', () => {
  // Vercel sends no Authorization header when CRON_SECRET is unset in the
  // project, so this branch is what a missing secret actually looks like.
  it('401s with no CRON_SECRET configured', async () => {
    vi.stubEnv('CRON_SECRET', undefined);
    const response = await GET(request('Bearer anything'));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ ok: false });
    expect(admin.chains('profiles')).toEqual([]);
  });

  it.each([
    ['no header', undefined],
    ['a wrong secret', 'Bearer nope'],
    ['the bare secret', 'secret'],
  ])('401s on %s', async (_, authorization) => {
    vi.stubEnv('CRON_SECRET', 'secret');
    const response = await GET(request(authorization));

    expect(response.status).toBe(401);
    expect(admin.chains('profiles')).toEqual([]);
  });

  it('pings profiles head-only on a valid secret', async () => {
    vi.stubEnv('CRON_SECRET', 'secret');
    admin.respond('profiles', {});
    const response = await GET(request('Bearer secret'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });

    const [chain] = admin.chains('profiles');
    expect(argsOf(chain, 'select')).toEqual([
      'id',
      { head: true, count: 'exact' },
    ]);
  });

  it('500s with the message when the ping fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('CRON_SECRET', 'secret');
    admin.respond('profiles', { error: { message: 'db down' } });

    const response = await GET(request('Bearer secret'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'db down',
    });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });
});
