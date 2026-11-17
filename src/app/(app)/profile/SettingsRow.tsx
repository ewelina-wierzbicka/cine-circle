'use client';

import ChevronIcon from '@/icons/Chevron';
import { twMerge } from '@/lib/cn';
import { ReactNode } from 'react';

type Props = {
  id: string;
  label: string;
  summary?: ReactNode;
  open: boolean;
  onToggle: () => void;
  tone?: 'default' | 'error';
  children: ReactNode;
};

export function SettingsRow({
  id,
  label,
  summary,
  open,
  onToggle,
  tone = 'default',
  children,
}: Props) {
  const color = tone === 'error' ? 'text-error' : 'text-secondary';

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center justify-between cursor-pointer bg-transparent border-none p-0"
      >
        <div className="text-left pr-2">
          <p className={twMerge('label-mono', color)}>{label}</p>
          {summary}
        </div>
        <ChevronIcon
          className={twMerge(
            'w-5 h-5 transition-transform duration-200',
            color,
            open ? 'rotate-90' : '-rotate-90',
          )}
        />
      </button>

      <div id={id}>{open && children}</div>
    </div>
  );
}
