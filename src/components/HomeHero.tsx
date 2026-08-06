'use client';

import SearchBox from '@/components/SearchBox';
import { twMerge } from '@/lib/cn';
import { MediaType, TrendingMovie } from '@/types';
import { Suspense, useEffect, useState, use } from 'react';

type Props = {
  hintTitles?: { id: number; title: string; type: MediaType }[];
  recentPostersPromise: Promise<TrendingMovie[]>;
};

export function HomeHero({ hintTitles, recentPostersPromise }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasRecentMedia, setHasRecentMedia] = useState(true);

  const shouldShift = dropdownOpen && !hasRecentMedia;

  return (
    <div
      className={twMerge(
        'flex-1 flex flex-col justify-center items-center px-6 md:px-12 relative z-10 transition-transform duration-300 ease-out pb-44 pt-7.5 sm:pb-23',
        shouldShift &&
          '-translate-y-[calc(50dvh-42%)] md:-translate-y-[calc(50dvh-30%)]',
      )}
    >
      <h2 className="font-serif text-[46px] xl:text-[52px] tracking-[-0.03em] text-center leading-none mb-3 animate-fade-up">
        What will you
        <br />
        <em className="text-mint">watch next?</em>
      </h2>
      <p className="text-secondary text-md text-center mb-12 animate-fade-in [animation-delay:80ms]">
        Search any title to add it to your list
      </p>
      <div className="w-full max-w-160 animate-fade-up [animation-delay:120ms]">
        <SearchBox
          hintTitles={hintTitles}
          onDropdownVisibleChange={setDropdownOpen}
        />
      </div>
      <Suspense fallback={null}>
        <RecentMediaState
          promise={recentPostersPromise}
          onResolved={setHasRecentMedia}
        />
      </Suspense>
    </div>
  );
}

function RecentMediaState({
  promise,
  onResolved,
}: {
  promise: Promise<TrendingMovie[]>;
  onResolved: (hasRecent: boolean) => void;
}) {
  const items = use(promise);
  useEffect(() => {
    onResolved(items.length > 0);
  }, [items, onResolved]);
  return null;
}
