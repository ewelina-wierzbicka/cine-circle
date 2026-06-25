'use client';

import StarIcon from '@/icons/Star';
import { twMerge } from '@/lib/cn';
import { useState } from 'react';

type Props = {
  value?: number;
  onChange: (value: number) => void;
  error?: string;
};

export default function StarRatingInput({ value = 0, onChange, error }: Props) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;
  const stars = displayValue / 2;

  return (
    <div>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHoverValue(null)}
        role="radiogroup"
        aria-label="Rating"
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const leftVal = i * 2 + 1;
          const rightVal = i * 2 + 2;
          const fillLevel =
            stars >= i + 1 ? 'full' : stars >= i + 0.5 ? 'half' : 'empty';

          return (
            <div key={i} className="relative size-8 cursor-pointer">
              <StarIcon
                className={twMerge(
                  'absolute size-8',
                  fillLevel === 'full'
                    ? 'text-amber-400'
                    : fillLevel === 'half'
                      ? 'text-white/15'
                      : 'text-white/15',
                )}
                filled={fillLevel === 'full'}
              />
              {fillLevel === 'half' && (
                <div className="absolute w-[50%] overflow-hidden">
                  <StarIcon className="size-8 text-amber-400" filled />
                </div>
              )}
              {/* Left half — odd rating values */}
              <button
                type="button"
                className="absolute left-0 top-0 w-1/2 h-full opacity-0"
                onMouseEnter={() => setHoverValue(leftVal)}
                onClick={() => onChange(value === leftVal ? 0 : leftVal)}
                aria-label={`${leftVal / 2} out of 5`}
              />
              {/* Right half — even rating values */}
              <button
                type="button"
                className="absolute right-0 top-0 w-1/2 h-full opacity-0"
                onMouseEnter={() => setHoverValue(rightVal)}
                onClick={() => onChange(value === rightVal ? 0 : rightVal)}
                aria-label={`${rightVal / 2} out of 5`}
              />
            </div>
          );
        })}
        {displayValue > 0 && (
          <span className="ml-2 text-sm text-secondary font-mono tabular-nums">
            {displayValue}/10
          </span>
        )}
        {value > 0 && (
          <button
            type="button"
            className="ml-2 text-xs text-secondary hover:text-primary transition-colors"
            onClick={() => onChange(0)}
            aria-label="Clear rating"
          >
            ✕
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
