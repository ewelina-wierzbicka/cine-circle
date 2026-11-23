// @vitest-environment node
import type { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/cron/keep-alive/route';
import { argsOf, createSupabaseMock } from '@/test/supabaseMock';

const admin = createSupabaseMock();
const captureSecurityEvent = vi.fn<(event: string) => void>();

vi.mock('@/lib/supabase/admin', () => ({
  adminSupabase: { from: (table: string) => admin.client.from(table) },
}));

vi.mock('@/lib/captureSecurityEvent', () => ({
  captureSecurityEvent: (event: string) => captureSecurityEvent(event),
}));

afterEach(() => {
  admin.reset();
  captureSecurityEvent.mockClear();
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
    expect(captureSecurityEvent).toHaveBeenCalledWith(
      'cron.keep_alive_unauthorized',
    );
  });

  it.each([
    ['no header', undefined],
    ['a wrong secret', 'Bearer nope'],
    ['the bare secret', 'secret'],
    ['a same-length wrong secret', 'Bearer secres'],
    ['a longer header', 'Bearer secret-extra'],
    ['a shorter header', 'Bearer secre'],
  ])('401s on %s', async (_, authorization) => {
    vi.stubEnv('CRON_SECRET', 'secret');
    const response = await GET(request(authorization));

    expect(response.status).toBe(401);
    expect(admin.chains('profiles')).toEqual([]);
    expect(captureSecurityEvent).toHaveBeenCalledWith(
      'cron.keep_alive_unauthorized',
    );
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
    expect(captureSecurityEvent).not.toHaveBeenCalled();
  });

  it('500s without the Postgres message when the ping fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubEnv('CRON_SECRET', 'secret');
    admin.respond('profiles', { error: { message: 'db down' } });

    const response = await GET(request('Bearer secret'));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ ok: false });
    expect(error).toHaveBeenCalledWith('[keep-alive ping failed]', 'db down');
    error.mockRestore();
  });
});
