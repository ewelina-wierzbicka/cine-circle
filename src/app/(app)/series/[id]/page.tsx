import type { Metadata } from 'next';
import MediaPage from '@/components/MediaPage';
import { getSeriesDetails } from '@/services/getMedia';
import { getStaticMediaParams } from '@/services/getStaticMediaParams';
import { mediaMetadata, NOT_FOUND_METADATA } from '@/lib/seo';

type Props = {
  params: Promise<{ id: string }>;
};

// The trending and popular ids, the same set `sitemap.ts` emits. Without this
// the segment has no build-time id and the prerendered shell is `loading.tsx`
// alone. `dynamicParams` stays default: an unlisted id still renders on demand.
export async function generateStaticParams() {
  return getStaticMediaParams('series');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: slug } = await params;
  const id = slug.split('-')[0];
  if (!/^\d+$/.test(id)) return NOT_FOUND_METADATA;

  // Already `use cache`, so this dedupes with the page render.
  const data = await getSeriesDetails(id);
  if (!data) return NOT_FOUND_METADATA;

  return mediaMetadata(data, 'series');
}

export default async function Page({ params }: Props) {
  const { id: slug } = await params;
  return <MediaPage slug={slug} mediaType="series" />;
}
