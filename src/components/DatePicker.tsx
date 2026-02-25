'use client';
import { FC, useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

type Props = {
  id: string;
  selected?: Date;
  handleChange: (date: Date) => void;
  className?: string;
  error?: string;
};

const DatePicker: FC<Props> = ({
  id,
  selected,
  handleChange,
  className,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDayPicker = () => {
    setIsOpen((prev) => !prev);
  };

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

  const handleDateSelect = (date: Date) => {
    handleChange(date);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <input
        type="text"
        id={id}
        name={id}
        readOnly
        value={selected ? selected.toLocaleDateString() : ''}
        placeholder="Select a date"
        className={`date-picker rounded-3xl bg-neutral-300/20 pl-6 pr-4 w-full h-10 outline-none focus:ring-4 focus:ring-neutral-300/20 focus:ring-offset-1 focus:ring-offset-primary/40 cursor-pointer ${className ?? ''}`}
        onClick={toggleDayPicker}
      />
      {error && (
        <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
      )}

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 z-50 bg-dark text-primary border border-primary/50 rounded-3xl p-4">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleDateSelect}
            required={true}
            classNames={{
              nav_button: 'color-accent',
              chevron: 'fill-accent',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;
