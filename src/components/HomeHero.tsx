'use client';

import SearchBox from '@/components/SearchBox';
import { twMerge } from '@/lib/cn';
import { useState } from 'react';

type Props = {
  hintTitles?: string[];
  hasRecentMedia?: boolean;
};

export function HomeHero({ hintTitles, hasRecentMedia }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
        Search any title to add it to your circle
      </p>
      <div className="w-full max-w-160 animate-fade-up [animation-delay:120ms]">
        <SearchBox
          hintTitles={hintTitles}
          onDropdownVisibleChange={setDropdownOpen}
        />
      </div>
    </div>
  );
}
