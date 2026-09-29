import type { Metadata } from 'next';
import Link from 'next/link';
import { toHref } from '@/lib/mediaUtils';
import { SITE_NAME } from '@/lib/seo';
import { getPopularMovies, getPopularSeries } from '@/services/getPopularMedia';
import { getTrendingMovies } from '@/services/getTrendingMovies';
import { PopularMedia } from '@/types';

export const metadata: Metadata = {
  title: 'Browse',
  description: `Browse trending movies, popular movies, and popular series on ${SITE_NAME}. Every title links to its page, where you can log it, rate it, and add it to your collection.`,
  alternates: { canonical: '/browse' },
};

type Section = { heading: string; items: PopularMedia[] };

function MediaLinkList({ items }: { items: PopularMedia[] }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
      {items.map((item) => (
        <li key={`${item.mediaType}-${item.id}`}>
          <Link
            href={toHref(item.id, item.title, item.mediaType)}
            className="font-sans text-base text-secondary hover:text-primary underline decoration-white/20 underline-offset-4 transition-colors"
          >
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function BrowsePage() {
  // All three are `use cache` + `cacheLife('days')`, so this page prerenders.
  // Nothing per-user belongs here.
  const [trending, popularMovies, popularSeries] = await Promise.all([
    getTrendingMovies(),
    getPopularMovies(1),
    getPopularSeries(1),
  ]);

  const sections: Section[] = [
    {
      heading: 'Trending this week',
      items: trending.map(({ id, title, type }) => ({
        id,
        title,
        mediaType: type,
      })),
    },
    { heading: 'Popular movies', items: popularMovies },
    { heading: 'Popular series', items: popularSeries },
  ];

  return (
    <div className="min-h-full px-6 md:px-12 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl sm:text-4xl text-primary mb-2">
          Browse movies and series
        </h1>
        <p className="font-sans text-base text-secondary leading-relaxed mb-10 max-w-2xl">
          Everything trending and popular right now, in one place. Open any
          title to see the details, then log it, rate it, and add it to your
          collection.
        </p>

        <div className="space-y-10">
          {sections.map(({ heading, items }) => (
            <section key={heading}>
              <h2 className="font-mono text-sm tracking-[0.15em] text-accent uppercase mb-4">
                {heading}
              </h2>
              <MediaLinkList items={items} />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
