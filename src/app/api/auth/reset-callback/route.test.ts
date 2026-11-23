// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/auth/reset-callback/route';

const exchangeCodeForSession = vi.fn<
  (code: string) => Promise<{ error?: unknown }>
>(async () => ({ error: null }));

const captureSecurityEvent = vi.fn<(event: string) => void>();

vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: (code: string) => exchangeCodeForSession(code),
    },
  }),
}));

vi.mock('@/lib/captureSecurityEvent', () => ({
  captureSecurityEvent: (event: string) => captureSecurityEvent(event),
}));

afterEach(() => {
  exchangeCodeForSession.mockClear();
  captureSecurityEvent.mockClear();
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
    expect(captureSecurityEvent).not.toHaveBeenCalled();
  });

  it('sends a missing code to the login toast without an exchange', async () => {
    const location = locationOf(await get(''));

    expect(exchangeCodeForSession).not.toHaveBeenCalled();
    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('error')).toBe('reset_failed');
    expect(captureSecurityEvent).toHaveBeenCalledWith(
      'auth.reset_callback_missing_code',
    );
  });

  it('sends a failed exchange to the login toast', async () => {
    exchangeCodeForSession.mockResolvedValueOnce({
      error: { message: 'expired' },
    });
    const location = locationOf(await get('?code=abc'));

    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('error')).toBe('reset_failed');
    expect(captureSecurityEvent).toHaveBeenCalledWith(
      'auth.reset_callback_exchange_failed',
    );
  });
});
