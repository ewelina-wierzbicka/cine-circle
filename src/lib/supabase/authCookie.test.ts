// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { hasAuthCookie } from '@/lib/supabase/authCookie';

const REF = 'sb-abcdefghijklmnop-auth-token';

function named(...names: string[]) {
  return names.map((name) => ({ name }));
}

describe('hasAuthCookie', () => {
  it.each([REF, `${REF}.0`, `${REF}.1`, `${REF}.12`])(
    'accepts the session cookie %s',
    (name) => {
      expect(hasAuthCookie(named(name))).toBe(true);
    },
  );

  // Every one of these is written with a 400-day maxAge by @supabase/ssr, so
  // treating an abandoned PKCE flow as a session would cost a Supabase round
  // trip on every request from that browser for over a year.
  it.each([
    `${REF}-code-verifier`,
    `${REF}-flow-0193f0e1-code-verifier`,
    `${REF}-flows-code-verifier`,
  ])('rejects the PKCE cookie %s', (name) => {
    expect(hasAuthCookie(named(name))).toBe(false);
  });

  it.each([
    'sb-abcdefghijklmnop-auth-token-',
    'sb-abcdefghijklmnop-auth-token.01',
    'sb-abcdefghijklmnop-auth-token.x',
    'sb--auth-token',
    'sb-auth-token',
    'other-auth-token',
    'session',
  ])('rejects %s', (name) => {
    expect(hasAuthCookie(named(name))).toBe(false);
  });

  it.each([
    'sb-abc123def-auth-token',
    'sb-127-auth-token',
    'sb-x-auth-token.0',
  ])('matches any project ref, never a hardcoded one: %s', (name) => {
    expect(hasAuthCookie(named(name))).toBe(true);
  });

  it('finds the session cookie among unrelated ones', () => {
    expect(
      hasAuthCookie(named('theme', `${REF}-code-verifier`, `${REF}.0`)),
    ).toBe(true);
  });

  it('is false for no cookies', () => {
    expect(hasAuthCookie([])).toBe(false);
  });
});
