import ErrorToast from '@/components/ErrorToast';
import { getMediaPageData } from '@/lib/getMediaPageData';
import { notFound } from 'next/navigation';
import MediaDetail from './MediaDetail';

type Props = {
  slug: string;
  mediaType: 'movie' | 'series';
  step?: string;
};

export default async function MediaPage({ slug, mediaType, step }: Props) {
  if (!Number(slug.split('-')[0])) notFound();

  const { data, error, initialStep } = await getMediaPageData(slug, mediaType, step);

  return (
    <>
      {error && <ErrorToast message={error} />}
      {data && <MediaDetail media={data} initialStep={initialStep} />}
    </>
  );
}
