import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { getMovieDetails, getSeriesDetails } from '@/services/getMedia';
import { getUserMedia } from '@/services/getUserMedia';
import { NormalizedMedia, SavedMedia } from '@/types';
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  let media: NormalizedMedia | SavedMedia = baseMedia;

  if (user) {
    const userMedia = await getUserMedia(tmdbId, mediaType, user.id).catch(
      (err: unknown) => {
        if ((err as { code?: string }).code === 'PGRST116') return null;
        throw err;
      },
    );
    if (userMedia) {
      const {
        id: savedId,
        watchStatus,
        watched_date,
        rating,
        review,
        media: savedMedia,
      } = userMedia;
      const {
        tmdb_id,
        title,
        release_date,
        last_air_date,
        poster_path,
        media_type,
      } = savedMedia;
      media = {
        tmdb_id,
        title,
        release_date,
        last_air_date,
        poster_path,
        media_type,
        genres: baseMedia.genres,
        overview: baseMedia.overview,
        recommendations: baseMedia.recommendations,
        director: baseMedia.director,
        id: savedId,
        watchStatus,
        watched_date,
        rating,
        review,
      } satisfies SavedMedia;
    }
  }

  return (
    <MediaDetail
      key={slug}
      media={media}
      initialStep={initialStep}
      isAuthenticated={isAuthenticated}
    />
  );
}
