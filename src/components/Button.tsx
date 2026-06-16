'use client';

import { twMerge } from '@/lib/cn';

type Props = {
  handleClick?: () => void;
  type?: 'submit' | 'button';
  color?: 'primary' | 'secondary' | 'mint';
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
};

export default function Button({
  handleClick,
  type = 'button',
  color = 'mint',
  variant = 'filled',
  size = 'medium',
  className,
  disabled,
  children,
}: Props) {
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={twMerge(
        'w-full rounded-xl font-semibold uppercase tracking-[0.08em] cursor-pointer transition-opacity',
        size === 'medium' ? 'h-12 text-base' : 'h-10 text-sm',
        variant === 'outlined'
          ? 'text-primary border border-white/50 hover:bg-white/5'
          : twMerge(
              color === 'mint'
                ? 'bg-mint text-dark hover:opacity-[0.82]'
                : color === 'secondary'
                  ? 'bg-secondary text-dark'
                  : 'bg-primary text-dark',
            ),
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
}
