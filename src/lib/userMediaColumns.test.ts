// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  RATING_MAX,
  REVIEW_MAX_LENGTH,
  userMediaColumns,
} from '@/lib/userMediaColumns';
import type { UserEntry } from '@/types';

const watched: UserEntry = {
  watchStatus: 'watched',
  watched_date: '2026-11-01',
  rating: 8,
  review: 'Great.',
};

describe('userMediaColumns', () => {
  it('keeps the watched fields of a watched entry', () => {
    expect(userMediaColumns(watched)).toEqual(watched);
  });

  it('drops the watched fields of a to_watch entry', () => {
    expect(userMediaColumns({ ...watched, watchStatus: 'to_watch' })).toEqual({
      watchStatus: 'to_watch',
      watched_date: undefined,
      rating: undefined,
      review: undefined,
    });
  });

  it('keeps only the four writable columns', () => {
    const entry = {
      ...watched,
      id: 99,
      user_id: 'someone-else',
      media_id: 42,
      added_at: '1999-01-01',
    } as UserEntry;

    expect(Object.keys(userMediaColumns(entry)).sort()).toEqual([
      'rating',
      'review',
      'watchStatus',
      'watched_date',
    ]);
  });

  it('keeps a cleared rating as null', () => {
    expect(userMediaColumns({ ...watched, rating: null }).rating).toBeNull();
  });

  it('accepts a review at the limit', () => {
    const review = 'a'.repeat(REVIEW_MAX_LENGTH);
    expect(userMediaColumns({ ...watched, review }).review).toBe(review);
  });

  it('rejects a review over the limit', () => {
    const review = 'a'.repeat(REVIEW_MAX_LENGTH + 1);
    expect(() => userMediaColumns({ ...watched, review })).toThrow(
      `up to ${REVIEW_MAX_LENGTH} characters`,
    );
  });

  it.each([-1, RATING_MAX + 1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects the rating %p',
    (rating) => {
      expect(() => userMediaColumns({ ...watched, rating })).toThrow(
        'Rating must be between',
      );
    },
  );

  it('rejects a non-numeric rating', () => {
    const entry = { ...watched, rating: '9' } as unknown as UserEntry;
    expect(() => userMediaColumns(entry)).toThrow('Rating must be between');
  });

  it('rejects a non-string review', () => {
    const entry = { ...watched, review: { length: 1 } } as unknown as UserEntry;
    expect(() => userMediaColumns(entry)).toThrow('Review must be text.');
  });

  it('rejects an unknown watch status', () => {
    const entry = { watchStatus: 'deleted' } as unknown as UserEntry;
    expect(() => userMediaColumns(entry)).toThrow(
      'Pick whether you watched it.',
    );
  });

  it('rejects an unparseable watched_date', () => {
    const entry = { ...watched, watched_date: 'someday' };
    expect(() => userMediaColumns(entry)).toThrow('Please pick a valid date.');
  });

  it('treats an empty watched_date as absent', () => {
    expect(
      userMediaColumns({ ...watched, watched_date: '' }).watched_date,
    ).toBeUndefined();
  });
});
