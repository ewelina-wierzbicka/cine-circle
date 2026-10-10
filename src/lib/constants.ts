import { FilterMediaType, RatingFilter } from '@/types';

export const PAGE_SIZE = 20;

export const MEDIA_TYPE_OPTIONS: { value: FilterMediaType; label: string }[] = [
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
  { value: 'all', label: 'Movies & Series' },
];

// Minimum-star semantics: "4+ stars" keeps 4 and 4.5. Default value last,
// matching MEDIA_TYPE_OPTIONS.
export const RATING_FILTER_OPTIONS: {
  value: RatingFilter;
  label: string;
}[] = [
  { value: '5', label: '5 stars' },
  { value: '4', label: '4+ stars' },
  { value: '3', label: '3+ stars' },
  { value: '2', label: '2+ stars' },
  { value: '1', label: '1+ stars' },
  { value: 'unrated', label: 'Unrated' },
  { value: 'all', label: 'Any rating' },
];
