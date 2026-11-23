// @vitest-environment node
import type { NextConfig } from 'next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs/config', () => ({
  withSentryConfig: (config: NextConfig) => config,
}));

const loadRules = async () => {
  const { default: config } = await import('../../next.config');
  const rules = await config.headers!();
  return rules;
};

const loadHeaders = async () => {
  const [rule] = await loadRules();
  return new Map(rule.headers.map(({ key, value }) => [key, value]));
};

const loadDirectives = async () => {
  const csp = (await loadHeaders()).get('Content-Security-Policy');
  expect(csp).toBeTruthy();
  const entries = csp!.split(';').map((directive) => {
    const [name, ...sources] = directive.trim().split(/\s+/);
    return [name, sources] as const;
  });
  return new Map(entries);
};

beforeEach(() => {
  vi.resetModules();
});

describe('security headers', () => {
  it('covers every path, so metadata routes keep the headers', async () => {
    const rules = await loadRules();

    expect(rules).toHaveLength(1);
    expect(rules[0].source).toBe('/:path*');
  });

  it.each([
    ['X-Content-Type-Options', 'nosniff'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['X-Frame-Options', 'DENY'],
    [
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
    ],
    [
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    ],
  ])('sends %s', async (key, value) => {
    expect((await loadHeaders()).get(key)).toBe(value);
  });

  it('sends a Content-Security-Policy, not a report-only one', async () => {
    const headers = await loadHeaders();

    expect(headers.get('Content-Security-Policy')).toBeTruthy();
    expect(headers.has('Content-Security-Policy-Report-Only')).toBe(false);
  });

  it.each([
    ['default-src', ["'self'"]],
    [
      'script-src',
      ["'self'", "'unsafe-inline'", 'https://va.vercel-scripts.com'],
    ],
    ['style-src', ["'self'", "'unsafe-inline'"]],
    [
      'img-src',
      [
        "'self'",
        'data:',
        'blob:',
        'https://image.tmdb.org',
        'https://*.supabase.co',
      ],
    ],
    [
      'connect-src',
      [
        "'self'",
        'https://*.supabase.co',
        'https://api.themoviedb.org',
        'https://va.vercel-scripts.com',
        'https://*.sentry.io',
      ],
    ],
    ['manifest-src', ["'self'"]],
    ['base-uri', ["'self'"]],
    ['form-action', ["'self'"]],
  ])('allows %s from %j', async (name, sources) => {
    expect((await loadDirectives()).get(name)).toEqual(
      expect.arrayContaining(sources),
    );
  });

  it.each([
    ['frame-ancestors', "'none'"],
    ['object-src', "'none'"],
  ])('blocks %s entirely', async (name, source) => {
    expect((await loadDirectives()).get(name)).toEqual([source]);
  });

  it('serves fonts from self only, never fonts.gstatic.com', async () => {
    expect((await loadDirectives()).get('font-src')).toEqual(["'self'"]);
  });

  it('allows the configured Supabase origin to be reached', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
    const directives = await loadDirectives();

    expect(directives.get('img-src')).toContain('http://127.0.0.1:54321');
    expect(directives.get('connect-src')).toContain('http://127.0.0.1:54321');
    vi.unstubAllEnvs();
  });
});
