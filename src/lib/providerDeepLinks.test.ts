// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  buildProviderDeepLinks,
  type WikidataClaims,
} from '@/lib/providerDeepLinks';

type Statement = NonNullable<WikidataClaims[string]>[number];

function statement(value: unknown, extra: Partial<Statement> = {}): Statement {
  return {
    rank: 'normal',
    mainsnak: { snaktype: 'value', datavalue: { value } },
    ...extra,
  };
}

function claim(value: unknown): Statement[] {
  return [statement(value)];
}

describe('buildProviderDeepLinks', () => {
  it('builds the movie URLs', () => {
    expect(
      buildProviderDeepLinks(
        {
          P1874: claim('80000001'),
          P8298: claim('movie/abc'),
          P9586: claim('umc.cmc.1'),
          P7595: claim('dis1'),
          P6466: claim('hulu-1'),
        },
        'movie',
      ),
    ).toEqual({
      netflix: 'https://www.netflix.com/title/80000001',
      max: 'https://www.hbomax.com/movie/abc',
      apple: 'https://tv.apple.com/movie/umc.cmc.1',
      disney: 'https://www.disneyplus.com/movies/wd/dis1',
      hulu: 'https://www.hulu.com/movie/hulu-1',
    });
  });

  it('uses the series properties for a series', () => {
    expect(
      buildProviderDeepLinks(
        {
          P9751: claim('umc.cmc.s'),
          P7596: claim('dis-s'),
          P6467: claim('hulu-s'),
        },
        'series',
      ),
    ).toEqual({
      apple: 'https://tv.apple.com/show/umc.cmc.s',
      disney: 'https://www.disneyplus.com/series/wp/dis-s',
      hulu: 'https://www.hulu.com/series/hulu-s',
    });
  });

  it('ignores the movie properties for a series', () => {
    expect(
      buildProviderDeepLinks(
        { P9586: claim('a'), P7595: claim('b'), P6466: claim('c') },
        'series',
      ),
    ).toEqual({});
  });

  // Also covers "the first matching rule per brand wins": P8055 comes later
  // and must not overwrite P14440.
  it('prefers the Prime Video id over the ASIN for Amazon', () => {
    expect(
      buildProviderDeepLinks(
        { P14440: claim('pv1'), P8055: claim('B000ASIN') },
        'movie',
      ),
    ).toEqual({ amazon: 'https://www.primevideo.com/detail/pv1' });
  });

  it('falls back to the ASIN when there is no Prime Video id', () => {
    expect(
      buildProviderDeepLinks({ P8055: claim('B000ASIN') }, 'movie'),
    ).toEqual({ amazon: 'https://www.amazon.com/gp/video/detail/B000ASIN' });
  });

  it('ignores deprecated statements', () => {
    expect(
      buildProviderDeepLinks(
        { P1874: [statement('80000001', { rank: 'deprecated' })] },
        'movie',
      ),
    ).toEqual({});
  });

  it('picks a preferred statement over a normal one', () => {
    expect(
      buildProviderDeepLinks(
        {
          P1874: [statement('111'), statement('222', { rank: 'preferred' })],
        },
        'movie',
      ),
    ).toEqual({ netflix: 'https://www.netflix.com/title/222' });
  });

  it.each(['novalue', 'somevalue'])('ignores a %s snak', (snaktype) => {
    expect(
      buildProviderDeepLinks(
        {
          P1874: [
            {
              rank: 'normal',
              mainsnak: { snaktype, datavalue: { value: '1' } },
            },
          ],
        },
        'movie',
      ),
    ).toEqual({});
  });

  it.each([123, { id: 'x' }, null])(
    'ignores the non-string value %j',
    (value) => {
      expect(buildProviderDeepLinks({ P1874: claim(value) }, 'movie')).toEqual(
        {},
      );
    },
  );

  it.each(['../x', 'a?b', 'a#b', 'a b', '/lead', 'a//b', 'https://evil.com'])(
    'rejects the unsafe id %s',
    (value) => {
      expect(buildProviderDeepLinks({ P1874: claim(value) }, 'movie')).toEqual(
        {},
      );
    },
  );

  it('returns {} for empty claims', () => {
    expect(buildProviderDeepLinks({}, 'movie')).toEqual({});
    expect(buildProviderDeepLinks({}, 'series')).toEqual({});
  });
});
