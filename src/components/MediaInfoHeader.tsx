'use client';

import { NormalizedMedia } from '@/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Props = {
  media: Pick<
    NormalizedMedia,
    | 'title'
    | 'release_date'
    | 'last_air_date'
    | 'director'
    | 'media_type'
    | 'genres'
    | 'overview'
  >;
};

export default function MediaInfoHeader({ media }: Props) {
  const {
    title,
    release_date,
    last_air_date,
    director,
    media_type,
    genres,
    overview,
  } = media;
  const searchParams = useSearchParams();
  const fromSearch = searchParams.get('from') === 'search';

  const releaseYear = release_date ? release_date.slice(0, 4) : 'N/A';
  const lastAirYear = last_air_date ? last_air_date.slice(0, 4) : null;
  const dateDisplay = lastAirYear
    ? `${releaseYear} – ${lastAirYear}`
    : releaseYear;
  const dirLabel = media_type === 'series' ? 'CREATED BY' : 'DIR.';
  const typeLabel = media_type === 'series' ? 'SERIES' : 'MOVIE';

  return (
    <>
      <Link
        href={fromSearch ? '/' : '/my-media'}
        className="inline-flex items-center gap-2 font-mono text-sm tracking-[0.12em] text-secondary hover:text-mint transition-colors duration-150 mb-9 self-start"
      >
        {fromSearch ? '← BACK TO SEARCH' : '← BACK TO COLLECTION'}
      </Link>
      {genres && genres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map((g) => (
            <span
              key={g.id}
              className="font-mono text-sm tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border border-secondary/25 text-mint"
            >
              {g.name}
            </span>
          ))}
        </div>
      )}
      <p className="font-mono text-sm tracking-[0.22em] text-secondary uppercase mb-4">
        {typeLabel}
      </p>
      <h1
        className="font-serif font-normal tracking-[-0.03em] leading-[0.95] mb-5 text-balance"
        style={{ fontSize: 'clamp(42px, 5.5vw, 72px)' }}
      >
        {title}
      </h1>
      <div className="flex items-center gap-5 mb-7">
        {director && (
          <>
            <span className="text-sm text-secondary">
              <span className="font-mono tracking-[0.08em] text-secondary mr-2">
                {dirLabel}
              </span>
              <span className="text-primary">{director}</span>
            </span>
            <div className="w-0.75 h-0.75 rounded-full bg-secondary shrink-0" />
          </>
        )}
        <span className="font-mono text-sm tracking-[0.04em] text-primary">
          {dateDisplay}
        </span>
      </div>
      <div className="mb-8 shrink-0 w-12 h-px bg-mint opacity-60" />
      {overview && (
        <p className="text-sm text-primary leading-relaxed mb-8">{overview}</p>
      )}
    </>
  );
}
