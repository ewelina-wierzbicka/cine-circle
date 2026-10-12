import { BackLink } from '@/components/BackLink';
import ClockIcon from '@/icons/Clock';
import { NormalizedMedia } from '@/types';

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
    | 'number_of_seasons'
    | 'number_of_episodes'
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
    number_of_seasons,
    number_of_episodes,
  } = media;

  const hasRuntime = runtime != null && runtime > 0;

  const counts = [
    number_of_seasons &&
      `${number_of_seasons} season${number_of_seasons === 1 ? '' : 's'}`,
    number_of_episodes &&
      `${number_of_episodes} episode${number_of_episodes === 1 ? '' : 's'}`,
  ].filter((c): c is string => Boolean(c));

  const releaseYear = release_date ? release_date.slice(0, 4) : 'N/A';
  const lastAirYear = last_air_date ? last_air_date.slice(0, 4) : null;
  const dateDisplay = lastAirYear
    ? `${releaseYear} – ${lastAirYear}`
    : releaseYear;
  const isSeries = media_type === 'series';
  const dirLabel = isSeries ? 'CREATED BY' : 'DIR.';
  const typeLabel = isSeries ? 'SERIES' : 'MOVIE';

  const tmdbScore =
    vote_average != null && vote_average > 0
      ? Math.round(vote_average * 10) / 10
      : null;

  return (
    <>
      {fromSearch && <BackLink href="/">BACK TO SEARCH</BackLink>}
      {genres && genres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {genres.map((g) => (
            <span
              key={g.id}
              className="ui-mono uppercase px-2.5 py-1 rounded-full border border-secondary/25 text-accent"
            >
              {g.name}
            </span>
          ))}
        </div>
      )}
      <p className="label-mono text-secondary mb-4">{typeLabel}</p>
      <h1
        className="font-serif font-normal tracking-[-0.03em] leading-[0.95] mb-5 text-balance"
        style={{ fontSize: 'clamp(42px, 5.5vw, 72px)' }}
      >
        {title}
      </h1>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-7">
        {director && (
          <>
            <span className="text-sm text-secondary w-full sm:w-auto">
              <span className="ui-mono text-secondary mr-2">{dirLabel}</span>
              <span className="text-primary">{director}</span>
            </span>
            <div className="w-0.75 h-0.75 rounded-full bg-secondary shrink-0 hidden sm:block " />
          </>
        )}
        <span className="ui-mono text-primary">{dateDisplay}</span>
      </div>
      {(hasRuntime || counts.length > 0) && (
        <div className="-mt-5 mb-7 flex flex-wrap items-center gap-x-3 gap-y-2 ui-mono text-primary">
          {hasRuntime && (
            <span className="flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5 shrink-0 text-secondary" />
              {isSeries
                ? `avg ${formatRuntime(runtime)} / episode`
                : formatRuntime(runtime)}
            </span>
          )}
          {counts.map((count, i) => (
            <span key={count} className="flex items-center gap-3">
              {(hasRuntime || i > 0) && (
                <span className="w-0.75 h-0.75 rounded-full bg-secondary shrink-0" />
              )}
              {count}
            </span>
          ))}
        </div>
      )}
      {tmdbScore != null && (
        <div className="-mt-5 mb-7">
          <span className="ui-mono">
            <span className="text-amber-400">{tmdbScore}</span>
            {vote_count != null && vote_count > 0 && (
              <span className="text-secondary ml-1">
                ({vote_count.toLocaleString()})
              </span>
            )}
            <span className="text-primary ml-1.5">avg on TMDB</span>
          </span>
        </div>
      )}
      <div className="mb-8 shrink-0 w-12 h-px bg-accent opacity-60" />
      {overview && <p className="text-sm text-primary mb-8">{overview}</p>}
    </>
  );
}
