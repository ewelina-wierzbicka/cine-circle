// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { isInfiniteScrollRoute } from '@/lib/infiniteScrollRoutes';

describe('isInfiniteScrollRoute', () => {
  it.each(['/search', '/collection', '/search/anything'])(
    'is true for %s',
    (path) => {
      expect(isInfiniteScrollRoute(path)).toBe(true);
    },
  );

  it.each(['/', '/movie/550', '/searchx'])('is false for %s', (path) => {
    expect(isInfiniteScrollRoute(path)).toBe(false);
  });
});
