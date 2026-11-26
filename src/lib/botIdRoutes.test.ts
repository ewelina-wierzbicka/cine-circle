// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { BOTID_CHECK_OPTIONS, BOTID_PROTECTED_ROUTES } from '@/lib/botIdRoutes';

describe('BOTID_PROTECTED_ROUTES', () => {
  it.each(BOTID_PROTECTED_ROUTES)('$path is POST only', ({ method }) => {
    expect(method).toBe('POST');
  });

  it('stays on the free Basic level', () => {
    expect(BOTID_CHECK_OPTIONS.advancedOptions.checkLevel).toBe('basic');
  });
});
