import { getMedia } from '@/services/getMedia';
import { FilterMediaType } from '@/types';
import SearchResults from './SearchResults';

type Props = {
  searchParams: Promise<{ query?: string; type?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { query = '', type: rawType = 'all' } = await searchParams;
  const type: FilterMediaType = ['movie', 'series', 'all'].includes(rawType)
    ? (rawType as FilterMediaType)
    : 'all';

  let initialData = null;
  if (query) {
    try {
      initialData = await getMedia(query, 1, type);
    } catch {
      initialData = null;
    }
  }

  return <SearchResults query={query} type={type} initialData={initialData} />;
}
