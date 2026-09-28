import { getTrendingMovies } from '@/services/getTrendingMovies';
import { getPopularMovies, getPopularSeries } from '@/services/getPopularMedia';
import { toHref } from '@/lib/mediaUtils';
import { MediaType, PopularMedia } from '@/types';

const POPULAR_PAGES = [1, 2];

// Same sources and same dedupe key as `sitemap.ts`, so every URL we ask
// crawlers to visit is also a page we prerendered. The slug comes from
// `toHref`, the call the pages canonicalise with, so a prerendered path never
// redirects.
async function getMediaEntries(): Promise<PopularMedia[]> {
  const [trending, popularPages] = await Promise.all([
    getTrendingMovies(),
    Promise.all([
      ...POPULAR_PAGES.map((page) => getPopularMovies(page)),
      ...POPULAR_PAGES.map((page) => getPopularSeries(page)),
    ]),
  ]);

  const media: PopularMedia[] = [
    ...trending.map((item) => ({
      id: item.id,
      title: item.title,
      mediaType: item.type,
    })),
    ...popularPages.flat(),
  ];

  const byKey = new Map<string, PopularMedia>();
  for (const item of media) {
    const key = `${item.mediaType}-${item.id}`;
    if (!byKey.has(key)) byKey.set(key, item);
  }

  return [...byKey.values()];
}

/**
 * Build-time params for `/movie/[id]` and `/series/[id]`.
 *
 * `dynamicParams` stays at its default, so an id that is not listed here still
 * renders on demand. A TMDB outage therefore costs prerendering, not the
 * build — every media page keeps working, it just streams again.
 */
export async function getStaticMediaParams(
  mediaType: MediaType,
): Promise<{ id: string }[]> {
  try {
    const entries = await getMediaEntries();

    return entries
      .filter((item) => item.mediaType === mediaType)
      .map((item) => {
        const href = toHref(item.id, item.title, item.mediaType);
        return { id: href.slice(href.lastIndexOf('/') + 1) };
      });
  } catch (err) {
    console.warn(
      `Skipping ${mediaType} prerendering, TMDB params unavailable:`,
      err,
    );
    return [];
  }
}
