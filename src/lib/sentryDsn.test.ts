// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { SENTRY_CSP_REPORT_URL, SENTRY_DSN } from '@/lib/sentryDsn';

describe('SENTRY_CSP_REPORT_URL', () => {
  it('is the Sentry security endpoint for the DSN project', () => {
    const { host, username, pathname } = new URL(SENTRY_DSN);
    const url = new URL(SENTRY_CSP_REPORT_URL);

    expect(url.host).toBe(host);
    expect(url.pathname).toBe(`/api${pathname}/security/`);
    expect(url.searchParams.get('sentry_key')).toBe(username);
  });

  it('carries no credentials in the URL itself', () => {
    expect(SENTRY_CSP_REPORT_URL).not.toContain('@');
  });
});
