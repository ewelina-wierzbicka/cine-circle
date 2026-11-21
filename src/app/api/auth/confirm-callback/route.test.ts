// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { GET } from '@/app/api/auth/confirm-callback/route';

const get = (query: string) =>
  GET(
    new NextRequest(
      `https://midnightframe.app/api/auth/confirm-callback${query}`,
    ),
  );

const locationOf = (response: Response) =>
  new URL(response.headers.get('location') ?? '');

describe('GET /api/auth/confirm-callback', () => {
  // Supabase verifies the email at click time, so this handler only redirects
  // and must never create a session.
  it('sends a code to /registration-confirmed', async () => {
    const response = await get('?code=abc');

    expect(response.status).toBe(307);
    const location = locationOf(response);
    expect(location.pathname).toBe('/registration-confirmed');
    expect(location.search).toBe('');
  });

  it('sends a missing code to the login toast', async () => {
    const location = locationOf(await get(''));

    expect(location.pathname).toBe('/login');
    expect(location.searchParams.get('error')).toBe('confirm_failed');
  });
});
