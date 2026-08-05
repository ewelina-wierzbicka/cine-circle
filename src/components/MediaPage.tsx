import { Suspense } from 'react';
import { getMovieDetails, getSeriesDetails } from '@/services/getMedia';
import { getEnrichedMedia } from '@/services/getEnrichedMedia';
import { NormalizedMedia } from '@/types';
import { notFound } from 'next/navigation';
import MediaDetail from './MediaDetail';

type Props = {
  slug: string;
  mediaType: 'movie' | 'series';
  step?: string;
};

export default async function MediaPage({ slug, mediaType, step }: Props) {
  const id = slug.split('-')[0];
  if (!id || !/^\d+$/.test(id)) notFound();

  const tmdbData =
    mediaType === 'series'
      ? await getSeriesDetails(id)
      : await getMovieDetails(id);
  if (!tmdbData) notFound();

  const initialStep = step === '2' ? 2 : 1;
  const baseMedia: NormalizedMedia = { ...tmdbData, media_type: mediaType };

  return (
    <Suspense
      fallback={
        <MediaDetail
          media={baseMedia}
          initialStep={initialStep}
          isAuthenticated={false}
        />
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
