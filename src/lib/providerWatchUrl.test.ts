import { describe, expect, it } from 'vitest';
import {
  MAPPED_PROVIDER_IDS,
  providerBrandKey,
  providerWatchUrl,
} from '@/lib/providerWatchUrl';

const NETFLIX = 8;
const UNMAPPED = 999999;

describe('providerBrandKey', () => {
  it.each([8, 175, 1796])('groups Netflix tier %i under netflix', (id) => {
    expect(providerBrandKey(id)).toBe('netflix');
  });

  it('keys an unmapped id by the id itself', () => {
    expect(providerBrandKey(UNMAPPED)).toBe(`id:${UNMAPPED}`);
  });
});

describe('providerWatchUrl', () => {
  it('prefers the deep link over the brand search URL', () => {
    expect(
      providerWatchUrl(NETFLIX, 'Fight Club', 'https://tmdb.example', {
        netflix: 'https://www.netflix.com/title/123',
      }),
    ).toBe('https://www.netflix.com/title/123');
  });

  it('uses the brand search URL with the title encoded when there is no deep link', () => {
    expect(providerWatchUrl(NETFLIX, 'Tom & Jerry: Hi?')).toBe(
      'https://www.netflix.com/search?q=Tom%20%26%20Jerry%3A%20Hi%3F',
    );
  });

  it('returns the TMDB fallback for an unmapped id', () => {
    expect(
      providerWatchUrl(UNMAPPED, 'Fight Club', 'https://tmdb.example/watch'),
    ).toBe('https://tmdb.example/watch');
  });

  it('returns undefined for an unmapped id with no fallback', () => {
    expect(providerWatchUrl(UNMAPPED, 'Fight Club')).toBeUndefined();
  });
});

describe('MAPPED_PROVIDER_IDS', () => {
  it('lists every id once', () => {
    expect(new Set(MAPPED_PROVIDER_IDS).size).toBe(MAPPED_PROVIDER_IDS.length);
  });
});
