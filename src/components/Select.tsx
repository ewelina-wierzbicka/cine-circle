'use client';

import ChevronIcon from '@/icons/Chevron';
import { twMerge } from '@/lib/cn';
import { useEffect, useRef, useState } from 'react';

type Option<T extends string = string> = {
  value: T;
  label: string;
};

type Props<T extends string = string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  className?: string;
};

export default function Select<T extends string = string>({
  value,
  options,
  onChange,
  className,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((prev) => !prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentIndex = options.findIndex((o) => o.value === value);
      const next = options[currentIndex + 1];
      if (next) onChange(next.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentIndex = options.findIndex((o) => o.value === value);
      const prev = options[currentIndex - 1];
      if (prev) onChange(prev.value);
    }
  };

  const handleChange = (value: T) => {
    onChange(value);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={twMerge('relative shrink-0', className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center justify-between gap-2 rounded-xl bg-bg2 border border-secondary/25 px-3.5 h-9.5 w-full cursor-pointer outline-none focus:border-mint transition-colors"
      >
        <span className="text-sm text-secondary">{selectedLabel}</span>
        <ChevronIcon
          className={twMerge(
            'w-3.5 h-3.5 text-secondary transition-transform duration-200 shrink-0',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1.5 w-full min-w-max rounded-xl bg-bg2 border border-white/[0.07] overflow-hidden shadow-xl"
        >
          {options.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              onClick={() => handleChange(option.value)}
              className={twMerge(
                'px-3.5 py-4 text-sm cursor-pointer transition-colors select-none text-secondary hover:text-primary',
                option.value === value && 'text-primary bg-bg3',
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
