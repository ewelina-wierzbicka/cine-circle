'use client';

import StarIcon from '@/icons/Star';
import { twMerge } from '@/lib/cn';
import { useRef, useState } from 'react';

type Props = {
  value?: number;
  onChange: (value: number) => void;
  error?: string;
  ariaLabelledby?: string;
};

export default function StarRatingInput({
  value = 0,
  onChange,
  error,
  ariaLabelledby,
}: Props) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const displayValue = hoverValue ?? value;
  const stars = displayValue / 2;
  // The radio that lives in the tab order: the checked one, or the first
  // when nothing is selected so keyboard users can enter the group.
  const tabbableValue = value > 0 ? value : 1;
  const radioRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const setValueAndFocus = (next: number) => {
    onChange(next);
    radioRefs.current[next]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const current = value > 0 ? value : 1;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        setValueAndFocus(Math.min(10, current + 1));
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        setValueAndFocus(Math.max(1, current - 1));
        break;
      case 'Home':
        e.preventDefault();
        setValueAndFocus(1);
        break;
      case 'End':
        e.preventDefault();
        setValueAndFocus(10);
        break;
      default:
        break;
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHoverValue(null)}
        onKeyDown={handleKeyDown}
        role="radiogroup"
        aria-label="Rating out of 5 stars"
        {...(ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : {})}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const leftVal = i * 2 + 1;
          const rightVal = i * 2 + 2;
          const fillLevel =
            stars >= i + 1 ? 'full' : stars >= i + 0.5 ? 'half' : 'empty';

          return (
            <div
              key={i}
              className="relative size-8 cursor-pointer rounded focus-within:ring-2 focus-within:ring-primary/40"
            >
              <StarIcon
                className={twMerge(
                  'absolute size-8',
                  fillLevel === 'empty' ? 'text-white/15' : 'text-amber-400',
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
                role="radio"
                aria-checked={value === leftVal}
                tabIndex={leftVal === tabbableValue ? 0 : -1}
                ref={(el) => {
                  radioRefs.current[leftVal] = el;
                }}
                className="absolute left-0 top-0 w-1/2 h-full opacity-0"
                onMouseEnter={() => setHoverValue(leftVal)}
                onClick={() => onChange(value === leftVal ? 0 : leftVal)}
                aria-label={`${leftVal / 2} out of 5`}
              />
              {/* Right half — even rating values */}
              <button
                type="button"
                role="radio"
                aria-checked={value === rightVal}
                tabIndex={rightVal === tabbableValue ? 0 : -1}
                ref={(el) => {
                  radioRefs.current[rightVal] = el;
                }}
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
            className="ml-2 inline-flex items-center justify-center min-w-6 min-h-6 rounded text-sm text-secondary hover:text-primary hover:bg-bg3 transition-colors"
            onClick={() => onChange(0)}
            aria-label="Clear rating"
          >
            ✕
          </button>
        )}
      </div>
      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </div>
  );
}
