// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { hasAuthCookie } from '@/lib/supabase/authCookie';

const names = (...values: string[]) => values.map((name) => ({ name }));

describe('hasAuthCookie', () => {
  it('is false with no cookies', () => {
    expect(hasAuthCookie([])).toBe(false);
  });

  it('is false with unrelated cookies only', () => {
    expect(hasAuthCookie(names('theme', 'sb-xyz-other', 'auth-token'))).toBe(
      false,
    );
  });

  it('is true for the session cookie', () => {
    expect(hasAuthCookie(names('theme', 'sb-xyz-auth-token'))).toBe(true);
  });

  it('is true for a chunked session cookie', () => {
    expect(hasAuthCookie(names('sb-xyz-auth-token.0'))).toBe(true);
    expect(hasAuthCookie(names('sb-xyz-auth-token.1'))).toBe(true);
  });

  it('matches any project ref, never a hardcoded one', () => {
    expect(hasAuthCookie(names('sb-abc123def-auth-token'))).toBe(true);
    expect(hasAuthCookie(names('sb-127-auth-token'))).toBe(true);
  });

  it('is true for the code-verifier cookie, so the flow still reaches Supabase', () => {
    expect(hasAuthCookie(names('sb-xyz-auth-token-code-verifier'))).toBe(true);
  });
});
