// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest';
import nextConfig from '../next.config';

let policy = '';

beforeAll(async () => {
  const routes = (await nextConfig.headers?.()) ?? [];
  const route = routes.find((entry) => entry.source === '/:path*');
  if (!route) throw new Error('no headers configured for /:path*');
  const header = route.headers.find(
    (entry) => entry.key === 'Content-Security-Policy',
  );
  if (!header) throw new Error('/:path* sends no Content-Security-Policy');
  policy = header.value;
});

const directive = (name: string) => {
  const match = policy.split('; ').find((part) => part.startsWith(`${name} `));
  if (!match) throw new Error(`CSP has no ${name} directive`);
  return match.slice(name.length + 1).split(' ');
};

describe('content security policy', () => {
  it('allows every origin the browser talks to', () => {
    const connectSrc = directive('connect-src');

    expect(connectSrc).toContain("'self'");
    expect(connectSrc).toContain('https://*.sentry.io');
    expect(connectSrc).toContain('https://*.supabase.co');
    expect(connectSrc).toContain('https://api.themoviedb.org');
    expect(connectSrc).toContain('https://va.vercel-scripts.com');
  });

  it('allows every origin images are loaded from', () => {
    const imgSrc = directive('img-src');

    expect(imgSrc).toContain("'self'");
    expect(imgSrc).toContain('data:');
    expect(imgSrc).toContain('blob:');
    expect(imgSrc).toContain('https://image.tmdb.org');
    expect(imgSrc).toContain('https://*.supabase.co');
  });

  it('keeps script-src narrow', () => {
    expect(directive('script-src')).toEqual([
      "'self'",
      "'unsafe-inline'",
      'https://va.vercel-scripts.com',
    ]);
    expect(policy).not.toContain('unsafe-eval');
    expect(policy).not.toContain('nonce-');
  });

  it('keeps the restrictive defaults', () => {
    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("font-src 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });
});
