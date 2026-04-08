import MediaPage from '@/components/MediaPage';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { id: slug } = await params;
  const { step } = await searchParams;
  return <MediaPage slug={slug} mediaType="movie" step={step} />;
}
