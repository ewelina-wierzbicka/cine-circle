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

  it.each([
    [154, 'w154'],
    [200, 'w342'],
    [342, 'w342'],
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

  // A custom loader disables the optimizer route, so it would 404.
  it('never points at /_next/image', () => {
    for (const width of [92, 200, 500, 1200]) {
      expect(load(POSTER, width)).not.toContain('/_next/image');
      expect(load('/logo.webp', width)).not.toContain('/_next/image');
    }
  });
});
