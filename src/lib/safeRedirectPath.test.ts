import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from '@/lib/safeRedirectPath';

describe('safeRedirectPath', () => {
  it('returns a same-site path unchanged', () => {
    expect(safeRedirectPath('/collection')).toBe('/collection');
  });

  it('keeps the query string', () => {
    expect(safeRedirectPath('/search?query=x')).toBe('/search?query=x');
  });

  it.each([null, undefined, ''])('returns undefined for %j', (value) => {
    expect(safeRedirectPath(value)).toBeUndefined();
  });

  it.each(['https://evil.com', '//evil.com', '/\\evil.com'])(
    'rejects the off-site target %s',
    (value) => {
      expect(safeRedirectPath(value)).toBeUndefined();
    },
  );
});
