// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  toHref,
  toSearchMediaListProps,
  toUserMediaListProps,
} from '@/lib/mediaUtils';
import type { NormalizedMedia, UserMedia } from '@/types';

describe('toHref', () => {
  it('builds a movie path', () => {
    expect(toHref(550, 'Fight Club', 'movie')).toBe('/movie/550-fight-club');
  });

  it('builds a series path', () => {
    expect(toHref(1399, 'Game of Thrones', 'series')).toBe(
      '/series/1399-game-of-thrones',
    );
  });

  it('lowercases and drops punctuation', () => {
    expect(toHref(1, 'Spider-Man: No Way Home', 'movie')).toBe(
      '/movie/1-spider-man-no-way-home',
    );
  });

  it('strips diacritics', () => {
    expect(toHref(1, 'Amélie', 'movie')).toBe('/movie/1-amelie');
  });

  it('collapses runs of spaces and dashes into one dash', () => {
    expect(toHref(1, 'A  -  B -- C', 'movie')).toBe('/movie/1-a-b-c');
  });

  // The proxy 308s any slug that is not toHref(...). A trailing dash here
  // would never match the canonical and redirect forever.
  it('drops the trailing dash when the title slugifies to nothing', () => {
    expect(toHref(123, '!!!', 'movie')).toBe('/movie/123');
    expect(toHref(123, '', 'series')).toBe('/series/123');
    expect(toHref(123, '東京物語', 'movie')).toBe('/movie/123');
  });
});

describe('toSearchMediaListProps', () => {
  it('appends ?from=search to the href', () => {
    const media: NormalizedMedia = {
      id: 550,
      title: 'Fight Club',
      media_type: 'movie',
    };
    expect(toSearchMediaListProps(media).href).toBe(
      '/movie/550-fight-club?from=search',
    );
  });
});

describe('toUserMediaListProps', () => {
  const userMedia: UserMedia = {
    id: 42,
    watchStatus: 'watched',
    rating: 8,
    media: {
      id: 7,
      tmdb_id: 1399,
      title: 'Game of Thrones',
      media_type: 'series',
    },
  };

  it('appends ?tab=<tab> when fromTab is passed', () => {
    expect(toUserMediaListProps(userMedia, 'watched').href).toBe(
      '/series/1399-game-of-thrones?tab=watched',
    );
  });

  it('omits the tab param without fromTab', () => {
    expect(toUserMediaListProps(userMedia).href).toBe(
      '/series/1399-game-of-thrones',
    );
  });

  it('returns the user_media id as id and the TMDB id as tmdb_id', () => {
    const props = toUserMediaListProps(userMedia);
    expect(props.id).toBe(42);
    expect(props.tmdb_id).toBe(1399);
  });
});
