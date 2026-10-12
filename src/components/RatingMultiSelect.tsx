'use client';

import StarRating from '@/components/StarRating';
import ChevronIcon from '@/icons/Chevron';
import { CheckCircleIcon } from '@/icons/CheckCircle';
import { twMerge } from '@/lib/cn';
import { RATING_FILTER_OPTIONS, ratingFilterLabel } from '@/lib/constants';
import { RatingFilter, RatingValue } from '@/types';
import { useEffect, useRef, useState } from 'react';

type Props = {
  value: RatingFilter;
  onChange: (value: RatingFilter) => void;
  className?: string;
};

const LISTBOX_ID = 'rating-filter-listbox';
const optionId = (rating: RatingValue) => `rating-filter-option-${rating}`;

const triggerLabel = (value: RatingFilter) => {
  if (value.length === 0) return 'Filter by rating: any rating';
  if (value.length === 1)
    return `Filter by rating: ${ratingFilterLabel(value[0])}`;
  return `Filter by rating: ${value.length} ratings selected`;
};

export function RatingMultiSelect({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;
    document
      .getElementById(optionId(RATING_FILTER_OPTIONS[highlighted].value))
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, highlighted]);

  const toggle = (rating: RatingValue) => {
    onChange(
      value.includes(rating)
        ? value.filter((v) => v !== rating)
        : [...value, rating],
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open) {
        toggle(RATING_FILTER_OPTIONS[highlighted].value);
      } else {
        setOpen(true);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlighted((prev) =>
        Math.min(prev + 1, RATING_FILTER_OPTIONS.length - 1),
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setHighlighted((prev) => Math.max(prev - 1, 0));
    }
  };

  return (
    <div
      ref={containerRef}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      className={twMerge('relative shrink-0', className)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? LISTBOX_ID : undefined}
        aria-activedescendant={
          open ? optionId(RATING_FILTER_OPTIONS[highlighted].value) : undefined
        }
        aria-label={triggerLabel(value)}
        className="flex items-center justify-between gap-2 rounded-xl bg-bg2 border border-secondary/25 px-3.5 h-9.5 w-full cursor-pointer outline-none focus:border-accent transition-colors"
      >
        {value.length === 1 ? (
          <span aria-hidden="true">
            <StarRating rating={value[0]} className="gap-0" />
          </span>
        ) : (
          <span className="text-sm text-secondary">
            {value.length === 0 ? 'Any rating' : `${value.length} ratings`}
          </span>
        )}
        <ChevronIcon
          className={twMerge(
            'w-3.5 h-3.5 text-secondary transition-transform duration-200 shrink-0',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-max rounded-xl bg-bg2 border border-secondary/25 overflow-hidden shadow-xl">
          <ul
            id={LISTBOX_ID}
            role="listbox"
            aria-multiselectable="true"
            aria-label="Ratings"
            className="max-h-80 overflow-y-auto"
          >
            {RATING_FILTER_OPTIONS.map((option, index) => {
              const selected = value.includes(option.value);

              return (
                <li
                  key={option.value}
                  id={optionId(option.value)}
                  role="option"
                  aria-selected={selected}
                  aria-label={option.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setHighlighted(index);
                    toggle(option.value);
                  }}
                  onMouseEnter={() => setHighlighted(index)}
                  className={twMerge(
                    'flex items-center justify-between gap-3 px-3.5 py-4 text-sm cursor-pointer transition-colors select-none text-secondary hover:text-primary border-b border-secondary/15 last:border-0',
                    selected && 'text-primary bg-bg3',
                    index === highlighted && 'bg-bg3',
                  )}
                >
                  <span aria-hidden="true">
                    <StarRating rating={option.value} />
                  </span>
                  <CheckCircleIcon
                    className={twMerge(
                      'size-4 shrink-0 text-accent transition-opacity',
                      selected ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </li>
              );
            })}
          </ul>

          {value.length > 0 && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChange([])}
              className="w-full px-3.5 py-3 text-sm font-mono tracking-ui uppercase text-secondary hover:text-primary border-t border-secondary/25 cursor-pointer transition-colors"
            >
              Clear ratings
            </button>
          )}
        </div>
      )}
    </div>
  );
}
