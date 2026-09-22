import { Suspense } from 'react';
import { getMovieDetails, getSeriesDetails } from '@/services/getMedia';
import { getEnrichedMedia } from '@/services/getEnrichedMedia';
import { NormalizedMedia } from '@/types';
import { notFound, permanentRedirect } from 'next/navigation';
import { toHref } from '@/lib/mediaUtils';
import MediaDetail from './MediaDetail';

export type MediaPageSearchParams = Record<
  string,
  string | string[] | undefined
>;

type Props = {
  slug: string;
  mediaType: 'movie' | 'series';
  searchParams?: MediaPageSearchParams;
};

function toQueryString(searchParams: MediaPageSearchParams): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value))
      value.forEach((entry) => params.append(key, entry));
    else if (value !== undefined) params.append(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export default async function MediaPage({
  slug,
  mediaType,
  searchParams = {},
}: Props) {
  const id = slug.split('-')[0];
  if (!id || !/^\d+$/.test(id)) notFound();

  const tmdbData =
    mediaType === 'series'
      ? await getSeriesDetails(id)
      : await getMovieDetails(id);
  if (!tmdbData) notFound();

  // One canonical URL per title: every other `<id>-<anything>` variant 308s here.
  const canonicalHref = toHref(tmdbData.id, tmdbData.title, mediaType);
  const requestedHref = `/${mediaType}/${slug}`;
  if (requestedHref !== canonicalHref) {
    permanentRedirect(`${canonicalHref}${toQueryString(searchParams)}`);
  }

  const step = searchParams.step;
  const initialStep = step === '2' ? 2 : 1;
  const baseMedia: NormalizedMedia = { ...tmdbData, media_type: mediaType };

  return (
    <Suspense
      fallback={
        <MediaDetail media={baseMedia} initialStep={initialStep} pending />
      }
    >
      <UserEnrichedMedia
        baseMedia={baseMedia}
        tmdbId={Number(id)}
        mediaType={mediaType}
        slug={slug}
        initialStep={initialStep}
      />
    </Suspense>
  );
}

type UserEnrichedMediaProps = {
  baseMedia: NormalizedMedia;
  tmdbId: number;
  mediaType: 'movie' | 'series';
  slug: string;
  initialStep: 1 | 2;
};

async function UserEnrichedMedia({
  baseMedia,
  tmdbId,
  mediaType,
  slug,
  initialStep,
}: UserEnrichedMediaProps) {
  const { media, isAuthenticated } = await getEnrichedMedia(
    baseMedia,
    tmdbId,
    mediaType,
  );

  return (
    <MediaDetail
      key={slug}
      media={media}
      initialStep={initialStep}
      isAuthenticated={isAuthenticated}
    />
  );
}
