import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NormalizedMedia } from '@/types';

// SITE_URL is read from the env at module scope, so every test stubs the env
// and imports a fresh copy of the module.
async function loadSeo(siteUrl = 'https://midnightframe.test') {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', siteUrl);
  vi.resetModules();
  return import('@/lib/seo');
}

afterEach(() => {
  vi.unstubAllEnvs();
});

const movie: NormalizedMedia = {
  id: 550,
  title: 'Fight Club',
  media_type: 'movie',
  release_date: '1999-10-15',
  overview: 'An insomniac office worker forms an underground fight club.',
  poster_path: '/poster.jpg',
};

describe('SITE_URL', () => {
  it('strips a trailing slash', async () => {
    const { SITE_URL } = await loadSeo('https://midnightframe.test/');
    expect(SITE_URL).toBe('https://midnightframe.test');
  });
});

describe('absoluteUrl', () => {
  it('prefixes SITE_URL', async () => {
    const { absoluteUrl } = await loadSeo();
    expect(absoluteUrl('/about')).toBe('https://midnightframe.test/about');
  });

  it('adds a missing leading slash', async () => {
    const { absoluteUrl } = await loadSeo();
    expect(absoluteUrl('about')).toBe('https://midnightframe.test/about');
  });

  it('never doubles the slash, even when SITE_URL had one', async () => {
    const { absoluteUrl } = await loadSeo('https://midnightframe.test/');
    expect(absoluteUrl('/about')).toBe('https://midnightframe.test/about');
  });
});

describe('truncateDescription', () => {
  it('returns short text unchanged', async () => {
    const { truncateDescription } = await loadSeo();
    expect(truncateDescription('Short text.', 20)).toBe('Short text.');
  });

  it('cuts at the last space and appends the ellipsis', async () => {
    const { truncateDescription } = await loadSeo();
    expect(truncateDescription('one two three four', 12)).toBe('one two…');
  });

  it('cuts mid-word when the slice has no space', async () => {
    const { truncateDescription } = await loadSeo();
    expect(truncateDescription('abcdefghijklmnop', 5)).toBe('abcde…');
  });

  it('defaults to 155 characters before the ellipsis', async () => {
    const { truncateDescription } = await loadSeo();
    const result = truncateDescription('word '.repeat(100));
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(156);
  });
});

describe('mediaMetadata', () => {
  it('canonicalises to absoluteUrl(toHref(...))', async () => {
    const { mediaMetadata, absoluteUrl } = await loadSeo();
    const { toHref } = await import('@/lib/mediaUtils');
    const canonical = absoluteUrl(toHref(550, 'Fight Club', 'movie'));

    const metadata = mediaMetadata(movie, 'movie');
    expect(metadata.alternates?.canonical).toBe(canonical);
    expect(canonical).toBe('https://midnightframe.test/movie/550-fight-club');
  });

  it('titles with the release year', async () => {
    const { mediaMetadata } = await loadSeo();
    expect(mediaMetadata(movie, 'movie').title).toBe('Fight Club (1999)');
  });

  it('falls back to last_air_date for the year', async () => {
    const { mediaMetadata } = await loadSeo();
    const series: NormalizedMedia = {
      id: 1,
      title: 'Show',
      media_type: 'series',
      last_air_date: '2019-05-19',
    };
    expect(mediaMetadata(series, 'series').title).toBe('Show (2019)');
  });

  it('uses the bare title with neither date', async () => {
    const { mediaMetadata } = await loadSeo();
    expect(
      mediaMetadata({ id: 1, title: 'Untitled', media_type: 'movie' }, 'movie')
        .title,
    ).toBe('Untitled');
  });

  it('describes with the truncated overview', async () => {
    const { mediaMetadata, truncateDescription } = await loadSeo();
    const overview = 'word '.repeat(60).trim();
    const metadata = mediaMetadata({ ...movie, overview }, 'movie');
    expect(metadata.description).toBe(truncateDescription(overview));
    expect(metadata.description).not.toBe(overview);
  });

  it('falls back to the Track sentence with no overview', async () => {
    const { mediaMetadata } = await loadSeo();
    const metadata = mediaMetadata({ ...movie, overview: undefined }, 'movie');
    expect(metadata.description).toMatch(/^Track Fight Club on MidnightFrame/);
  });

  it('sets the OpenGraph type per media type', async () => {
    const { mediaMetadata } = await loadSeo();
    expect(mediaMetadata(movie, 'movie').openGraph).toMatchObject({
      type: 'video.movie',
    });
    expect(
      mediaMetadata({ ...movie, media_type: 'series' }, 'series').openGraph,
    ).toMatchObject({ type: 'video.tv_show' });
  });

  it('uses the w780 social poster at 780x1170', async () => {
    const { mediaMetadata } = await loadSeo();
    expect(mediaMetadata(movie, 'movie').openGraph?.images).toEqual([
      {
        url: 'https://image.tmdb.org/t/p/w780/poster.jpg',
        width: 780,
        height: 1170,
        alt: 'Fight Club',
      },
    ]);
  });

  it('has no images without a poster', async () => {
    const { mediaMetadata } = await loadSeo();
    const metadata = mediaMetadata(
      { ...movie, poster_path: undefined },
      'movie',
    );
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter?.images).toBeUndefined();
  });
});

describe('NOT_FOUND_METADATA', () => {
  it('is noindex, nofollow', async () => {
    const { NOT_FOUND_METADATA } = await loadSeo();
    expect(NOT_FOUND_METADATA.robots).toEqual({ index: false, follow: false });
  });
});
