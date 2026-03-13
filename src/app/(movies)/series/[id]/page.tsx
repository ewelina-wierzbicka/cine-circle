import ErrorToast from '@/components/ErrorToast';
import { getMediaPageData } from '@/lib/getMediaPageData';
import { notFound } from 'next/navigation';
import MediaDetail from '../../MediaDetail';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { id: slug } = await params;
  const { step } = await searchParams;

  if (!Number(slug.split('-')[0])) notFound();

  const { data, error, initialStep } = await getMediaPageData(slug, 'series', step);

  return (
    <>
      {error && <ErrorToast message={error} />}
      {data && <MediaDetail media={data} initialStep={initialStep} />}
    </>
  );
}
