'use client';

import Input from '@/components/Input';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

type Props = {
  id: string;
  selected?: Date;
  handleChange: (date?: Date) => void;
  className?: string;
  error?: string;
};

export default function DatePicker({
  id,
  selected,
  handleChange,
  className,
  error,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const openedWithKeyboard = useRef(false);

  const toggleDayPicker = () => {
    setIsOpen((prev) => !prev);
  };

  const openDayPicker = () => {
    openedWithKeyboard.current = true;
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      openDayPicker();
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen && openedWithKeyboard.current && pickerRef.current) {
      const focusable =
        pickerRef.current.querySelector<HTMLElement>('[tabindex="0"]');
      if (focusable) {
        requestAnimationFrame(() => focusable.focus());
      } else {
        requestAnimationFrame(() => pickerRef.current?.focus());
      }
      openedWithKeyboard.current = false;
    }
  }, [isOpen]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDateSelect = (date?: Date) => {
    handleChange(date);
    setIsOpen(false);
  };

  const handlePickerKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Input
        id={id}
        name={id}
        readOnly
        value={
          selected && !isNaN(selected.getTime())
            ? selected.toLocaleDateString('en-US')
            : ''
        }
        placeholder="Select a date"
        className={`cursor-pointer ${className ?? ''}`}
        onClick={toggleDayPicker}
        handleKeyDown={handleKeyDown}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${id}-dialog` : undefined}
        error={error}
      />

      {isOpen && (
        <div
          id={`${id}-dialog`}
          ref={pickerRef}
          role="dialog"
          aria-label="Choose date"
          tabIndex={-1}
          onKeyDown={handlePickerKeyDown}
          className="absolute top-full right-0 mt-2 z-50 bg-bg2 text-primary border border-white/[0.07] rounded-2xl p-4 shadow-xl outline-none"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleDateSelect}
            classNames={{
              nav_button: 'color-mint',
              chevron: 'fill-mint',
            }}
            disabled={{ after: new Date() }}
          />
        </div>
      )}
    </div>
  );
}
