import ClockIcon from '@/icons/Clock';
import { NormalizedMedia } from '@/types';
import Link from 'next/link';

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
    | 'runtime'
    | 'vote_average'
    | 'vote_count'
  >;
  fromSearch?: boolean;
};

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function MediaInfoHeader({ media, fromSearch = false }: Props) {
  const {
    title,
    release_date,
    last_air_date,
    director,
    media_type,
    genres,
    overview,
    runtime,
    vote_average,
    vote_count,
  } = media;

  const releaseYear = release_date ? release_date.slice(0, 4) : 'N/A';
  const lastAirYear = last_air_date ? last_air_date.slice(0, 4) : null;
  const dateDisplay = lastAirYear
    ? `${releaseYear} – ${lastAirYear}`
    : releaseYear;
  const dirLabel = media_type === 'series' ? 'CREATED BY' : 'DIR.';
  const typeLabel = media_type === 'series' ? 'SERIES' : 'MOVIE';

  const tmdbScore =
    vote_average != null && vote_average > 0
      ? Math.round(vote_average * 10) / 10
      : null;

  return (
    <>
      {fromSearch && (
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-sm tracking-[0.12em] text-secondary hover:text-accent transition-colors duration-150 mb-9 self-start"
        >
          ← BACK TO SEARCH
        </Link>
      )}
      {genres && genres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map((g) => (
            <span
              key={g.id}
              className="font-mono text-sm tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border border-secondary/25 text-accent"
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
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-7">
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
        {runtime != null && runtime > 0 && (
          <>
            <div className="w-0.75 h-0.75 rounded-full bg-secondary shrink-0" />
            <span className="flex items-center gap-1.5 font-mono text-sm tracking-[0.04em] text-secondary">
              <ClockIcon className="w-3.5 h-3.5 shrink-0" />
              {formatRuntime(runtime)}
            </span>
          </>
        )}
        {tmdbScore != null && (
          <>
            <div className="w-0.75 h-0.75 rounded-full bg-secondary shrink-0" />
            <span className="font-mono text-sm tracking-[0.04em]">
              <span className="text-amber-400">{tmdbScore}</span>
              {vote_count != null && vote_count > 0 && (
                <span className="text-secondary ml-1">
                  ({vote_count.toLocaleString()})
                </span>
              )}
              <span className="text-secondary ml-1.5">avg on TMDB</span>
            </span>
          </>
        )}
      </div>
      <div className="mb-8 shrink-0 w-12 h-px bg-accent opacity-60" />
      {overview && (
        <p className="text-sm text-primary leading-relaxed mb-8">{overview}</p>
      )}
    </>
  );
}
