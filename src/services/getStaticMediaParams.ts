import { getTrendingMovies } from '@/services/getTrendingMovies';
import { getPopularMovies, getPopularSeries } from '@/services/getPopularMedia';
import { toHref } from '@/lib/mediaUtils';
import { MediaType, PopularMedia } from '@/types';

const POPULAR_PAGES = [1, 2];

/**
 * Trending plus popular media, deduped. The single source for both
 * `sitemap.ts` and the `generateStaticParams` below, so every URL we ask
 * crawlers to visit is a URL we prerendered.
 */
export async function getPopularMediaEntries(): Promise<PopularMedia[]> {
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

  // Trending and popular overlap heavily, and a duplicate URL wastes crawl
  // budget. First entry wins: trending is the higher-priority source.
  const byKey = new Map<string, PopularMedia>();
  for (const item of media) {
    const key = `${item.mediaType}-${item.id}`;
    if (!byKey.has(key)) byKey.set(key, item);
  }

  return [...byKey.values()];
}

/**
 * Build-time ids for `/movie/[id]` and `/series/[id]`.
 *
 * Without these the segment has no build-time param, so `generateMetadata`
 * awaits a fallback param, metadata postpones, and the crawler gets a `<head>`
 * with no title, description or canonical. A concrete param resolves the
 * metadata at build instead, into the real head of that id's shell.
 *
 * `dynamicParams` stays at its default, so an unlisted id still renders on
 * demand. A TMDB outage therefore costs prerendering, not the build.
 */
export async function getStaticMediaParams(
  mediaType: MediaType,
): Promise<{ id: string }[]> {
  try {
    const entries = await getPopularMediaEntries();

    return entries
      .filter((item) => item.mediaType === mediaType)
      .map((item) => {
        // The slug the pages canonicalise to, so no prerendered path redirects.
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
