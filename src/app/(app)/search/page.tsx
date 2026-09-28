import SearchBox from '@/components/SearchBox';
import { createClient } from '@/lib/supabase/server';
import { getMedia } from '@/services/getMedia';
import { FilterMediaType } from '@/types';
import type { Metadata } from 'next';
import SearchResults from './SearchResults';

type Props = {
  searchParams: Promise<{ query?: string; type?: string }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { query = '' } = await searchParams;
  const canonical = { canonical: '/search' };

  if (!query) {
    return {
      title: 'Search movies and series',
      description:
        'Search the full TMDB catalogue of movies and series, then add what you find to your MidnightFrame collection.',
      alternates: canonical,
    };
  }

  return {
    title: `Search results for "${query}"`,
    description: `Movies and series matching "${query}" on MidnightFrame.`,
    alternates: canonical,
    // Query permutations are thin, near-duplicate pages.
    robots: { index: false, follow: true },
  };
}

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
