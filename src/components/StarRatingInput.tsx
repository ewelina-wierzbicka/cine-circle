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
        // Allow decrement all the way to 0 so keyboard users can clear
        // the rating, matching the click-to-clear behavior on each star.
        setValueAndFocus(Math.max(0, current - 1));
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
          const halves: Array<[number, 'left' | 'right']> = [
            [leftVal, 'left'],
            [rightVal, 'right'],
          ];
          return (
            <div key={i} className="flex">
              {halves.map(([val, side]) => {
                const filled = displayValue >= val;
                return (
                  <button
                    key={val}
                    type="button"
                    role="radio"
                    aria-checked={value === val}
                    tabIndex={val === tabbableValue ? 0 : -1}
                    ref={(el) => {
                      radioRefs.current[val] = el;
                    }}
                    onMouseEnter={() => setHoverValue(val)}
                    onClick={() => onChange(value === val ? 0 : val)}
                    aria-label={`${val / 2} out of 5`}
                    className="relative w-4 h-8 overflow-hidden cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-1 focus-visible:ring-offset-dark"
                  >
                    <StarIcon
                      className={twMerge(
                        'absolute top-0 size-8',
                        side === 'left' ? 'left-0' : '-left-4',
                        filled ? 'text-amber-400' : 'text-white/15',
                      )}
                      filled={filled}
                    />
                  </button>
                );
              })}
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
