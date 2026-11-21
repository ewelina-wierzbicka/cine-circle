// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/auth/oauth-callback/route';

const exchangeCodeForSession = vi.fn<
  (code: string) => Promise<{ error?: unknown }>
>(async () => ({ error: null }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: (code: string) => exchangeCodeForSession(code),
    },
  }),
}));

afterEach(() => {
  exchangeCodeForSession.mockClear();
});

const get = (query: string) =>
  GET(
    new NextRequest(
      `https://midnightframe.app/api/auth/oauth-callback${query}`,
    ),
  );

const locationOf = (response: Response) =>
  new URL(response.headers.get('location') ?? '');

describe('GET /api/auth/oauth-callback', () => {
  it('exchanges the code and lands on / with no rurl', async () => {
    const location = locationOf(await get('?code=abc'));

    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc');
    expect(location.pathname).toBe('/');
  });

  it('sends a missing code to the login toast without an exchange', async () => {
    const location = locationOf(await get(''));

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('error')).toBe('oauth_failed');
  });

  it('sends a failed exchange to the login toast', async () => {
    exchangeCodeForSession.mockResolvedValueOnce({
      error: { message: 'bad code' },
    });
    const location = locationOf(await get('?code=abc'));

    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('error')).toBe('oauth_failed');
  });

  it('honours a same-site rurl', async () => {
    const location = locationOf(await get('?code=abc&rurl=%2Fcollection'));
    expect(location.pathname).toBe('/collection');
  });

  // safeRedirectPath owns the rules; this is the route-level guard against an
  // open redirect reaching NextResponse.redirect.
  it.each([
    ['a protocol-relative host', '//evil.com'],
    ['a backslash host', '/\\evil.com'],
    ['an absolute URL', 'https://evil.com/x'],
  ])('falls back to / on %s', async (_, rurl) => {
    const location = locationOf(
      await get(`?code=abc&rurl=${encodeURIComponent(rurl)}`),
    );

    expect(location.origin).toBe('https://midnightframe.app');
    expect(location.pathname).toBe('/');
  });
});
