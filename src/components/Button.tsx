'use client';

import { twMerge } from '@/lib/cn';
import { MouseEvent } from 'react';

type Props = {
  handleClick?: (e: MouseEvent<HTMLButtonElement>) => void | Promise<void>;
  type?: 'submit' | 'button';
  variant?: 'filled' | 'outlined';
  color?: 'mint' | 'error';
  size?: 'small' | 'medium';
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

export default function Button({
  handleClick,
  type = 'button',
  variant = 'filled',
  color = 'mint',
  size = 'medium',
  className,
  disabled,
  children,
}: Props) {
  const filledColors =
    color === 'error'
      ? 'bg-red-800 text-primary hover:bg-red-900'
      : 'bg-mint text-dark hover:opacity-[0.82]';

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={twMerge(
        'w-full rounded-xl font-semibold uppercase tracking-[0.08em] cursor-pointer transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-dark',
        size === 'medium'
          ? 'py-3 text-base md:text-sm lg:text-base'
          : 'py-2 text-sm',
        variant === 'outlined'
          ? 'text-primary border border-white/50 hover:bg-white/5'
          : filledColors,
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
}
