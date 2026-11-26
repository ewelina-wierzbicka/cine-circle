// @vitest-environment node
import { describe, expect, it } from 'vitest';
import imageLoader from '@/lib/imageLoader';

const POSTER = 'https://image.tmdb.org/t/p/w342/abc123.jpg';

function load(src: string, width: number) {
  return imageLoader({ src, width, quality: 75 });
}

describe('imageLoader', () => {
  it.each([
    'https://xyz.supabase.co/storage/v1/object/sign/avatar/u/a.webp?token=t',
    '/logo.webp',
  ])('returns the non-TMDB src %s unchanged', (src) => {
    expect(load(src, 200)).toBe(src);
  });

  // Every bucket in TMDB_WIDTHS has a case: dropping one from the list must
  // fail here, since 185 and 500 are both in images.deviceSizes.
  it.each([
    [92, 'w92'],
    [93, 'w154'],
    [154, 'w154'],
    [155, 'w185'],
    [185, 'w185'],
    [200, 'w342'],
    [342, 'w342'],
    [343, 'w500'],
    [500, 'w500'],
    [501, 'w780'],
    [780, 'w780'],
    [781, 'original'],
    [3840, 'original'],
  ])('maps width %i to the %s bucket', (width, bucket) => {
    expect(load(POSTER, width)).toBe(
      `https://image.tmdb.org/t/p/${bucket}/abc123.jpg`,
    );
  });

  it('keeps the file segment through the rewrite', () => {
    expect(load('https://image.tmdb.org/t/p/original/x/y.png', 92)).toBe(
      'https://image.tmdb.org/t/p/w92/x/y.png',
    );
  });

  it.each([
    'https://image.tmdb.org/other/abc.jpg',
    'https://image.tmdb.org/t/p/w342',
    'https://image.tmdb.org/t/p/w342/',
  ])('returns %s unchanged when the path is not /t/p/<size>/<file>', (src) => {
    expect(load(src, 200)).toBe(src);
  });
});
