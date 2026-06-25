import StarRating from '@/components/StarRating';
import { NormalizedMedia, UserEntry } from '@/types';
import Link from 'next/link';
import Button from './Button';

type Props = {
  media: NormalizedMedia;
  userEntry: Pick<UserEntry, 'watched_date' | 'rating' | 'review'>;
  onEdit: () => void;
};

export default function WatchedMediaInfo({ media, userEntry, onEdit }: Props) {
  const { title, director, release_date, last_air_date, media_type } = media;
  const { watched_date, rating, review } = userEntry;
  const releaseYear = release_date ? release_date.slice(0, 4) : 'N/A';
  const lastAirYear = last_air_date ? last_air_date.slice(0, 4) : null;
  const dateDisplay = lastAirYear
    ? `${releaseYear} – ${lastAirYear}`
    : releaseYear;
  const dirLabel = media_type === 'series' ? 'CREATED BY' : 'DIR.';
  const typeLabel = media_type === 'series' ? 'SERIES' : 'FILM';

  const formattedDate = watched_date
    ? new Date(watched_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-col w-full animate-fade-up max-w-full sm:max-w-120">
      <Link
        href="/my-media"
        className="inline-flex items-center gap-2 font-mono text-sm tracking-[0.12em] text-secondary hover:text-mint transition-colors duration-150 mb-9 self-start"
      >
        ← BACK TO COLLECTION
      </Link>
      <p className="font-mono text-sm tracking-[0.22em] text-mint uppercase mb-3.5">
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
          <span className="text-sm text-secondary">
            <span className="font-mono text-xs tracking-[0.08em] text-secondary mr-2">
              {dirLabel}
            </span>
            {director}
          </span>
        )}
        {director && (
          <div className="w-0.75 h-0.75 rounded-full bg-secondary shrink-0" />
        )}
        <span className="font-mono text-sm tracking-[0.04em] text-secondary">
          {dateDisplay}
        </span>
      </div>
      <div className="mb-8 shrink-0 w-12 h-px bg-mint opacity-60" />
      <div className="flex flex-col gap-8 mb-8">
        {rating != null && (
          <div>
            <p className="font-mono text-sm tracking-[0.18em] text-secondary uppercase mb-3">
              Your Rating
            </p>
            <div className="flex items-center gap-3">
              <StarRating rating={rating} />
              <span className="font-mono text-sm tracking-[0.06em] text-secondary">
                {rating}/10
              </span>
            </div>
          </div>
        )}
        {formattedDate && (
          <div>
            <p className="font-mono text-sm tracking-[0.18em] text-secondary uppercase mb-2">
              Watched
            </p>
            <p className="text-sm text-primary">{formattedDate}</p>
          </div>
        )}
        {review && (
          <div>
            <p className="font-mono text-sm tracking-[0.18em] text-secondary uppercase mb-2">
              Review
            </p>
            <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap">
              {review}
            </p>
          </div>
        )}
      </div>
      <div>
        <Button handleClick={onEdit}>UPDATE</Button>
      </div>
    </div>
  );
}
