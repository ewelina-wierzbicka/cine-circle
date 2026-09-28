import { Suspense } from 'react';
import { getMovieDetails, getSeriesDetails } from '@/services/getMedia';
import { getEnrichedMedia } from '@/services/getEnrichedMedia';
import { NormalizedMedia } from '@/types';
import { notFound, permanentRedirect } from 'next/navigation';
import { toHref } from '@/lib/mediaUtils';
import MediaActions from './MediaActions';
import MediaActionsSkeleton from './MediaActionsSkeleton';
import MediaDetail from './MediaDetail';
import MediaEntryForm from './MediaEntryForm';
import UserEntryFormSkeleton from './UserEntryFormSkeleton';

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

  const canonicalHref = toHref(tmdbData.id, tmdbData.title, mediaType);
  const requestedHref = `/${mediaType}/${slug}`;
  if (requestedHref !== canonicalHref) {
    permanentRedirect(`${canonicalHref}${toQueryString(searchParams)}`);
  }

  const initialStep = searchParams.step === '2' ? 2 : 1;
  const baseMedia: NormalizedMedia = { ...tmdbData, media_type: mediaType };
  const tmdbId = Number(id);

  return (
    <MediaDetail
      key={slug}
      media={baseMedia}
      initialStep={initialStep}
      fromSearch={searchParams.from === 'search'}
      actions={
        <Suspense fallback={<MediaActionsSkeleton />}>
          <UserEnrichedActions
            baseMedia={baseMedia}
            tmdbId={tmdbId}
            mediaType={mediaType}
          />
        </Suspense>
      }
      form={
        <Suspense fallback={<UserEntryFormSkeleton />}>
          <UserEnrichedForm
            baseMedia={baseMedia}
            tmdbId={tmdbId}
            mediaType={mediaType}
          />
        </Suspense>
      }
    />
  );
}

type EnrichedProps = {
  baseMedia: NormalizedMedia;
  tmdbId: number;
  mediaType: 'movie' | 'series';
};

async function UserEnrichedActions({
  baseMedia,
  tmdbId,
  mediaType,
}: EnrichedProps) {
  const { media, isAuthenticated } = await getEnrichedMedia(
    baseMedia,
    tmdbId,
    mediaType,
  );

  return <MediaActions media={media} isAuthenticated={isAuthenticated} />;
}

async function UserEnrichedForm({
  baseMedia,
  tmdbId,
  mediaType,
}: EnrichedProps) {
  const { media } = await getEnrichedMedia(baseMedia, tmdbId, mediaType);

  return <MediaEntryForm media={media} />;
}
