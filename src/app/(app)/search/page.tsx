import SearchBox from '@/components/SearchBox';
import { createClient } from '@/lib/supabase/server';
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialData = null;
  if (query) {
    try {
      initialData = await getMedia(query, 1, type);
    } catch {
      initialData = null;
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-8 px-6 md:px-12">
      <div className="mb-8 w-full max-w-160">
        <SearchBox initialQuery={query} initialType={type} />
      </div>
      <SearchResults
        query={query}
        type={type}
        initialData={initialData}
        isAuthenticated={!!user}
      />
    </div>
  );
}
