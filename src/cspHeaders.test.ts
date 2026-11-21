import { describe, expect, it } from 'vitest';
import { contentSecurityPolicy } from '../next.config';

const directive = (name: string) => {
  const match = contentSecurityPolicy
    .split('; ')
    .find((part) => part.startsWith(`${name} `));
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
    expect(contentSecurityPolicy).not.toContain('unsafe-eval');
    expect(contentSecurityPolicy).not.toContain('nonce-');
  });

  it('keeps the restrictive defaults', () => {
    expect(contentSecurityPolicy).toContain("default-src 'self'");
    expect(contentSecurityPolicy).toContain("font-src 'self'");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
  });
});
