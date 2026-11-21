// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { tmdbImageUrl, tmdbSocialImageUrl } from '@/lib/tmdbImage';

describe('tmdbImage', () => {
  it('tmdbImageUrl prefixes the w342 fallback bucket', () => {
    expect(tmdbImageUrl('/abc.jpg')).toBe(
      'https://image.tmdb.org/t/p/w342/abc.jpg',
    );
  });

  it('tmdbSocialImageUrl pins the w780 bucket', () => {
    expect(tmdbSocialImageUrl('/abc.jpg')).toBe(
      'https://image.tmdb.org/t/p/w780/abc.jpg',
    );
  });
});
