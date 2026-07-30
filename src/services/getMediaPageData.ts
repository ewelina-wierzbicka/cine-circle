import { cacheLife, cacheTag } from 'next/cache';
import { getMovieDetails, getSeriesDetails } from '@/services/getMedia';
import { NormalizedMedia } from '@/types';

export async function getCachedTmdbData(
  id: string,
  mediaType: 'movie' | 'series',
): Promise<NormalizedMedia> {
  'use cache';
  cacheLife('days');
  cacheTag(`tmdb-${mediaType}-${id}`);
  return mediaType === 'series' ? getSeriesDetails(id) : getMovieDetails(id);
}
