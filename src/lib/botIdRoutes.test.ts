// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { BOTID_CHECK_OPTIONS, BOTID_PROTECTED_ROUTES } from '@/lib/botIdRoutes';

describe('BOTID_PROTECTED_ROUTES', () => {
  it('protects the three auth form posts and nothing else', () => {
    expect(BOTID_PROTECTED_ROUTES.map((route) => route.path)).toEqual([
      '/login',
      '/register',
      '/forgot-password',
    ]);
  });

  // A webhook, a cron path or a page GET never carries a challenge header, so
  // listing one would reject every real request.
  it.each(BOTID_PROTECTED_ROUTES)('$path is POST only', ({ method }) => {
    expect(method).toBe('POST');
  });

  // Mismatched levels fail verification, and Deep Analysis bills per call.
  it('asks for the same Basic level on both sides', () => {
    expect(BOTID_CHECK_OPTIONS.advancedOptions.checkLevel).toBe('basic');

    for (const route of BOTID_PROTECTED_ROUTES)
      expect(route.advancedOptions).toBe(BOTID_CHECK_OPTIONS.advancedOptions);
  });
});
