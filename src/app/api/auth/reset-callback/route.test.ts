// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/auth/reset-callback/route';

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
      `https://midnightframe.app/api/auth/reset-callback${query}`,
    ),
  );

const locationOf = (response: Response) =>
  new URL(response.headers.get('location') ?? '');

describe('GET /api/auth/reset-callback', () => {
  it('exchanges the code and sends the user to /reset-password', async () => {
    const location = locationOf(await get('?code=abc'));

    expect(exchangeCodeForSession).toHaveBeenCalledWith('abc');
    expect(location.pathname).toBe('/reset-password');
  });

  it('sends a missing code to the login toast without an exchange', async () => {
    const location = locationOf(await get(''));

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('error')).toBe('reset_failed');
  });

  it('sends a failed exchange to the login toast', async () => {
    exchangeCodeForSession.mockResolvedValueOnce({
      error: { message: 'expired' },
    });
    const location = locationOf(await get('?code=abc'));

    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('error')).toBe('reset_failed');
  });
});
