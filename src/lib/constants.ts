import { FilterMediaType } from '@/types';

export const PAGE_SIZE = 20;

export const MEDIA_TYPE_OPTIONS: { value: FilterMediaType; label: string }[] = [
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
  { value: 'all', label: 'Movies & Series' },
];
