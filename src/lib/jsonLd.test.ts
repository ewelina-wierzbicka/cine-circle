import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HOME_FAQ } from '@/lib/homeFaq';
import type { NormalizedMedia } from '@/types';

const SITE = 'https://midnightframe.test';

// jsonLd.ts derives its ids from SITE_URL, which seo.ts reads at module scope.
async function loadJsonLd() {
  vi.resetModules();
  return import('@/lib/jsonLd');
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SITE_URL', SITE);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const movie: NormalizedMedia = {
  id: 550,
  title: 'Fight Club',
  media_type: 'movie',
  release_date: '1999-10-15',
  overview: 'An insomniac forms a fight club.',
  poster_path: '/poster.jpg',
  genres: [{ id: 18, name: 'Drama' }],
  runtime: 139,
  director: 'David Fincher',
};

const series: NormalizedMedia = {
  id: 1399,
  title: 'Game of Thrones',
  media_type: 'series',
  release_date: '2011-04-17',
  overview: 'Nine noble families fight for control.',
  poster_path: '/got.jpg',
  runtime: 60,
  director: 'David Benioff',
  number_of_seasons: 8,
  number_of_episodes: 73,
};

function emptyValues(node: unknown, path = '$'): string[] {
  if (node === null || node === '') return [path];
  if (Array.isArray(node)) {
    return node.flatMap((item, i) => emptyValues(item, `${path}[${i}]`));
  }
  if (typeof node === 'object') {
    return Object.entries(node).flatMap(([key, value]) =>
      emptyValues(value, `${path}.${key}`),
    );
  }
  return [];
}

describe('jsonLdScript', () => {
  it('escapes < so a </script> in an overview cannot close the tag', async () => {
    const { jsonLdScript, mediaJsonLd } = await loadJsonLd();
    const payload = mediaJsonLd(
      { ...movie, overview: 'Bad </script><script>alert(1)</script>' },
      'movie',
    );
    const script = jsonLdScript(payload);

    expect(script).not.toContain('<');
    expect(JSON.parse(script)).toEqual(payload);
  });
});

describe('mediaJsonLd', () => {
  it('types a movie as Movie and a series as TVSeries', async () => {
    const { mediaJsonLd } = await loadJsonLd();
    expect(mediaJsonLd(movie, 'movie')['@type']).toBe('Movie');
    expect(mediaJsonLd(series, 'series')['@type']).toBe('TVSeries');
  });

  it('sets @id to the canonical url plus #media', async () => {
    const { mediaJsonLd } = await loadJsonLd();
    const minimal = mediaJsonLd(
      { id: 1, title: 'X', media_type: 'movie' },
      'movie',
    );
    expect(minimal['@id']).toBe(`${SITE}/movie/1-x#media`);
    expect(minimal['@id']).toBe(`${minimal.url}#media`);
  });

  it('emits an ISO 8601 duration for a movie with a runtime', async () => {
    const { mediaJsonLd } = await loadJsonLd();
    expect(mediaJsonLd(movie, 'movie').duration).toBe('PT2H19M');
  });

  it('never emits a duration for a series', async () => {
    const { mediaJsonLd } = await loadJsonLd();
    expect(mediaJsonLd(series, 'series')).not.toHaveProperty('duration');
  });

  it('emits startDate for a series only', async () => {
    const { mediaJsonLd } = await loadJsonLd();
    expect(mediaJsonLd(series, 'series').startDate).toBe('2011-04-17');
    expect(mediaJsonLd(movie, 'movie')).not.toHaveProperty('startDate');
  });

  it('emits the season and episode counts for a series', async () => {
    const { mediaJsonLd } = await loadJsonLd();
    expect(mediaJsonLd(series, 'series')).toMatchObject({
      numberOfSeasons: 8,
      numberOfEpisodes: 73,
    });
  });

  it.each([undefined, 0])(
    'omits the season and episode counts when they are %j',
    async (count) => {
      const { mediaJsonLd } = await loadJsonLd();
      const payload = mediaJsonLd(
        { ...series, number_of_seasons: count, number_of_episodes: count },
        'series',
      );
      expect(payload).not.toHaveProperty('numberOfSeasons');
      expect(payload).not.toHaveProperty('numberOfEpisodes');
    },
  );

  it('never emits null or an empty string', async () => {
    const { mediaJsonLd } = await loadJsonLd();
    const sparse: NormalizedMedia = {
      id: 2,
      title: 'Sparse',
      media_type: 'movie',
      overview: '',
      poster_path: '',
      release_date: '',
      director: '',
      genres: [{ id: 1, name: '' }],
      runtime: 0,
    };
    for (const payload of [
      mediaJsonLd(movie, 'movie'),
      mediaJsonLd(series, 'series'),
      mediaJsonLd(sparse, 'movie'),
      mediaJsonLd({ ...sparse, media_type: 'series' }, 'series'),
    ]) {
      expect(emptyValues(payload)).toEqual([]);
    }
  });

  it('uses the w780 social poster for the image', async () => {
    const { mediaJsonLd } = await loadJsonLd();
    const { tmdbSocialImageUrl } = await import('@/lib/tmdbImage');
    expect(mediaJsonLd(movie, 'movie').image).toBe(
      tmdbSocialImageUrl('/poster.jpg'),
    );
  });
});

describe('breadcrumbJsonLd', () => {
  it('lists Home then the title at positions 1 and 2', async () => {
    const { breadcrumbJsonLd } = await loadJsonLd();
    expect(breadcrumbJsonLd(movie, 'movie').itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Fight Club',
        item: `${SITE}/movie/550-fight-club`,
      },
    ]);
  });
});

describe('siteJsonLd', () => {
  it('carries Organization, WebSite and WebApplication', async () => {
    const { siteJsonLd } = await loadJsonLd();
    expect(siteJsonLd()['@graph'].map((node) => node['@type'])).toEqual([
      'Organization',
      'WebSite',
      'WebApplication',
    ]);
  });
});

describe('faqJsonLd', () => {
  it('reuses HOME_FAQ verbatim, one question per entry', async () => {
    const { faqJsonLd } = await loadJsonLd();
    const { mainEntity } = faqJsonLd();

    expect(mainEntity).toHaveLength(HOME_FAQ.length);
    mainEntity.forEach((entry, i) => {
      expect(entry.name).toBe(HOME_FAQ[i].question);
      expect(entry.acceptedAnswer.text).toBe(HOME_FAQ[i].answer);
    });
  });
});

describe('aboutPageJsonLd', () => {
  it('ships the full Organization node, not a bare @id reference', async () => {
    const { aboutPageJsonLd, siteJsonLd } = await loadJsonLd();
    const organization = aboutPageJsonLd('About', 'Desc')['@graph'].find(
      (node) => node['@type'] === 'Organization',
    );

    expect(organization).toEqual(siteJsonLd()['@graph'][0]);
    expect(organization).toMatchObject({
      name: 'MidnightFrame',
      url: SITE,
      logo: expect.any(Object),
    });
  });
});

describe('Organization logo', () => {
  it('is square, at least 112px, with explicit width and height', async () => {
    const { siteJsonLd } = await loadJsonLd();
    const { logo } = siteJsonLd()['@graph'][0];

    expect(logo.width).toBe(logo.height);
    expect(logo.width).toBeGreaterThanOrEqual(112);
    expect(logo.url).toBe(`${SITE}/icons/icon-512.png`);
  });
});
