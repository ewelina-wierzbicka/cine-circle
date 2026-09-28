import type { Metadata } from 'next';
import MediaPage, { type MediaPageSearchParams } from '@/components/MediaPage';
import { getMovieDetails } from '@/services/getMedia';
import { mediaMetadata, NOT_FOUND_METADATA } from '@/lib/seo';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<MediaPageSearchParams>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: slug } = await params;
  const id = slug.split('-')[0];
  if (!/^\d+$/.test(id)) return NOT_FOUND_METADATA;

  // Already `use cache`, so this dedupes with the page render.
  const data = await getMovieDetails(id);
  if (!data) return NOT_FOUND_METADATA;

  return mediaMetadata(data, 'movie');
}

export default async function Page({ params, searchParams }: Props) {
  const { id: slug } = await params;
  const search = await searchParams;
  return <MediaPage slug={slug} mediaType="movie" searchParams={search} />;
}
