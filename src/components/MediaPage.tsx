import { Suspense } from 'react';
import MediaDetailSkeleton from '@/components/MediaDetailSkeleton';
import { createClient } from '@/lib/supabase/server';
import { getCachedTmdbData } from '@/services/getMediaPageData';
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

  // TMDB data is cached — fast, served from edge cache
  const tmdbData = await getCachedTmdbData(id, mediaType);

  return (
    <Suspense fallback={<MediaDetailSkeleton />}>
      <UserEnrichedMedia
        tmdbData={tmdbData}
        tmdbId={Number(id)}
        mediaType={mediaType}
        slug={slug}
        step={step}
      />
    </Suspense>
  );
}

type UserEnrichedMediaProps = {
  tmdbData: NormalizedMedia;
  tmdbId: number;
  mediaType: 'movie' | 'series';
  slug: string;
  step?: string;
};

async function UserEnrichedMedia({
  tmdbData,
  tmdbId,
  mediaType,
  slug,
  step,
}: UserEnrichedMediaProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  const initialStep = step === '2' ? 2 : 1;

  let media: NormalizedMedia | SavedMedia = {
    ...tmdbData,
    media_type: mediaType,
  };

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
        genres: tmdbData.genres,
        overview: tmdbData.overview,
        recommendations: tmdbData.recommendations,
        director: tmdbData.director,
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
