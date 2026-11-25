import { UserEntry } from '@/types';

export const REVIEW_MAX_LENGTH = 2000;
export const RATING_MIN = 0;
export const RATING_MAX = 10;

const WATCH_STATUSES = ['watched', 'to_watch'] as const;

type WatchStatus = (typeof WATCH_STATUSES)[number];

export type UserMediaColumns = {
  watchStatus: WatchStatus;
  watched_date?: string;
  rating?: number | null;
  review?: string;
};

const watchStatusOf = (value: unknown): WatchStatus => {
  const status = WATCH_STATUSES.find((allowed) => allowed === value);
  if (!status) throw new Error('Pick whether you watched it.');
  return status;
};

const watchedDateOf = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)))
    throw new Error('Please pick a valid date.');
  return value;
};

const ratingOf = (value: unknown): number | null | undefined => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value) ||
    value < RATING_MIN ||
    value > RATING_MAX
  )
    throw new Error(`Rating must be between ${RATING_MIN} and ${RATING_MAX}.`);
  return value;
};

const reviewOf = (value: unknown): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') throw new Error('Review must be text.');
  if (value.length > REVIEW_MAX_LENGTH)
    throw new Error(`Please use up to ${REVIEW_MAX_LENGTH} characters.`);
  return value;
};

export const userMediaColumns = (entry: UserEntry): UserMediaColumns => {
  const watchStatus = watchStatusOf(entry?.watchStatus);

  if (watchStatus !== 'watched')
    return {
      watchStatus,
      watched_date: undefined,
      rating: undefined,
      review: undefined,
    };

  return {
    watchStatus,
    watched_date: watchedDateOf(entry.watched_date),
    rating: ratingOf(entry.rating),
    review: reviewOf(entry.review),
  };
};
