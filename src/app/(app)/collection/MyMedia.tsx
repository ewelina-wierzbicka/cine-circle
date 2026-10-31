'use client';

import Input from '@/components/Input';
import { RatingMultiSelect } from '@/components/RatingMultiSelect';
import Select from '@/components/Select';
import { useSearch } from '@/hooks/useSearch';
import { MEDIA_TYPE_OPTIONS } from '@/lib/constants';
import {
  CollectionTab,
  FilterMediaType,
  RatingFilter,
  UserMediaPage,
} from '@/types';
import { useState } from 'react';
import { CollectionTabs } from './CollectionTabs';
import UserMediaList from './UserMediaList';

type Props = {
  tab: CollectionTab;
  initialData: UserMediaPage;
};

export default function MyMedia({ tab, initialData }: Props) {
  const [mediaType, setMediaType] = useState<FilterMediaType>('all');
  const [rating, setRating] = useState<RatingFilter>([]);
  const appliedRating = tab === 'watched' ? rating : [];
  const { debouncedQuery, handleChange } = useSearch({
    onSearch: () => {},
    debounceMs: 400,
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-10 pb-12">
        <div className="w-full sm:w-[25%]">
          <p className="label-mono text-accent mb-2">My Collection</p>
          <h1 className="display-serif">
            {tab === 'watched' ? (
              <em className="text-primary">Watched</em>
            ) : (
              <>
                To <em className="text-primary">Watch</em>
              </>
            )}
          </h1>
        </div>
        <div className="flex items-center justify-end gap-2.5 shrink-0 flex-wrap w-full sm:w-[75%]">
          <CollectionTabs active={tab} />
          <div className="flex gap-2.5 w-full sm:w-auto flex-wrap justify-end">
            <div className="w-full sm:w-53.25">
              <Input
                type="text"
                placeholder="Filter…"
                onChange={handleChange}
                id="filter"
                className="h-10"
                variant="search"
              />
            </div>

            <Select
              value={mediaType}
              options={MEDIA_TYPE_OPTIONS}
              onChange={setMediaType}
              className="w-full sm:w-53.25"
            />

            {tab === 'watched' && (
              <RatingMultiSelect
                value={rating}
                onChange={setRating}
                className="w-full sm:w-44"
              />
            )}
          </div>
        </div>
      </div>

      <UserMediaList
        watchStatus={tab}
        initialData={initialData}
        searchQuery={debouncedQuery}
        mediaType={mediaType}
        rating={appliedRating}
      />
    </>
  );
}
