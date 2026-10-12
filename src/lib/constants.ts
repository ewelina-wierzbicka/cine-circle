import { FilterMediaType, RatingValue } from '@/types';

export const PAGE_SIZE = 20;

export const MEDIA_TYPE_OPTIONS: { value: FilterMediaType; label: string }[] = [
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
  { value: 'all', label: 'Movies & Series' },
];

export const ratingFilterLabel = (value: RatingValue) => {
  const stars = value / 2;
  if (stars === 0.5) return 'Half a star';
  if (stars === 1) return '1 star';
  return `${stars} stars`;
};

// Ordered high to low, so 5 stars sits at the top of the listbox.
export const RATING_FILTER_OPTIONS: { value: RatingValue; label: string }[] = (
  [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] as RatingValue[]
).map((value) => ({ value, label: ratingFilterLabel(value) }));
