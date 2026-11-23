// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FAILURE_THRESHOLD } from '@/lib/authFailureAlert';
import { login, register, sendPasswordReset } from '@/services/auth';

type AuthFailure = { message: string; status?: number; code?: string } | null;

const { auth, captureSecurityEvent, forwardedFor, redirect } = vi.hoisted(
  () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    captureSecurityEvent: vi.fn(),
    forwardedFor: { current: '9.9.9.9' },
    redirect: vi.fn(),
  }),
);

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => Promise.resolve({ auth }),
}));

vi.mock('@/lib/captureSecurityEvent', () => ({ captureSecurityEvent }));

vi.mock('next/navigation', () => ({ redirect }));

vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: (name: string) =>
        name === 'x-forwarded-for' ? forwardedFor.current : null,
    }),
}));

const rateLimited = { message: 'Too many requests', status: 429 };

function queue(error: AuthFailure) {
  auth.signInWithPassword.mockResolvedValue({ error });
  auth.signUp.mockResolvedValue({ error });
  auth.resetPasswordForEmail.mockResolvedValue({ error });
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://midnightframe.app');
  queue(null);
});

afterEach(() => {
  captureSecurityEvent.mockClear();
  redirect.mockClear();
  vi.unstubAllEnvs();
});

describe('login', () => {
  it('reports nothing on a single typo', async () => {
    forwardedFor.current = '1.0.0.1';
    queue({ message: 'Invalid login credentials', status: 400 });

    await expect(login('a@b.com', 'wrong')).resolves.toEqual({
      error: 'Invalid login credentials',
    });
    expect(captureSecurityEvent).not.toHaveBeenCalled();
  });

  it('reports one burst event on a sustained run', async () => {
    forwardedFor.current = '1.0.0.2';
    queue({ message: 'Invalid login credentials', status: 400 });

    for (let i = 0; i < FAILURE_THRESHOLD * 2; i++)
      await login('a@b.com', 'wrong');

    expect(captureSecurityEvent.mock.calls).toEqual([
      ['auth.sign_in_failure_burst'],
    ]);
  });

  it('reports a 429 immediately, with no threshold', async () => {
    forwardedFor.current = '1.0.0.3';
    queue(rateLimited);

    await login('a@b.com', 'wrong');

    expect(captureSecurityEvent.mock.calls).toEqual([['auth.rate_limited']]);
  });

  it('reports nothing on success', async () => {
    await login('a@b.com', 'right');

    expect(captureSecurityEvent).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith('/');
  });
});

describe('register', () => {
  it('reports a 429', async () => {
    queue(rateLimited);

    await expect(register('a@b.com', 'pw')).resolves.toEqual({
      error: 'Too many requests',
    });
    expect(captureSecurityEvent.mock.calls).toEqual([['auth.rate_limited']]);
  });

  it('reports nothing on any other failure', async () => {
    queue({ message: 'User already registered', status: 422 });

    await register('a@b.com', 'pw');

    expect(captureSecurityEvent).not.toHaveBeenCalled();
  });
});

describe('sendPasswordReset', () => {
  it('reports a 429 and keeps the generic outcome', async () => {
    queue(rateLimited);

    await expect(sendPasswordReset('a@b.com')).resolves.toEqual({
      error: 'Too many requests',
    });
    expect(captureSecurityEvent.mock.calls).toEqual([['auth.rate_limited']]);
  });

  // Account enumeration must not get easier: still a silent success.
  it('stays silent on user-not-found', async () => {
    queue({ message: 'User not found', status: 400 });

    await expect(sendPasswordReset('a@b.com')).resolves.toEqual({});
    expect(captureSecurityEvent).not.toHaveBeenCalled();
  });
});
