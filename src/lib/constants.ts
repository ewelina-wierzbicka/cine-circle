import { FilterMediaType, RatingFilter } from '@/types';

export const PAGE_SIZE = 20;

export const MEDIA_TYPE_OPTIONS: { value: FilterMediaType; label: string }[] = [
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
  { value: 'all', label: 'Movies & Series' },
];

// Values are the raw stored rating (1..10, half-star steps), so one star is 2.
// Minimum-star semantics: "4+ stars" keeps 8 and 9. Default value last,
// matching MEDIA_TYPE_OPTIONS.
export const RATING_FILTER_OPTIONS: {
  value: RatingFilter;
  label: string;
}[] = [
  { value: '10', label: '5 stars' },
  { value: '8', label: '4+ stars' },
  { value: '6', label: '3+ stars' },
  { value: '4', label: '2+ stars' },
  { value: '2', label: '1+ stars' },
  { value: 'unrated', label: 'Unrated' },
  { value: 'all', label: 'Any rating' },
];
