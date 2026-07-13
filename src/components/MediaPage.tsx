import ErrorToast from '@/components/ErrorToast';
import { createClient } from '@/lib/supabase/server';
import { getMediaPageData } from '@/services/getMediaPageData';
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const { data, error, initialStep } = await getMediaPageData(
    slug,
    mediaType,
    step,
    isAuthenticated,
  );

  return (
    <>
      {error && <ErrorToast message={error} />}
      {data && (
        <MediaDetail
          key={slug}
          media={{ ...data, media_type: mediaType }}
          initialStep={initialStep}
          isAuthenticated={isAuthenticated}
        />
      )}
    </>
  );
}
