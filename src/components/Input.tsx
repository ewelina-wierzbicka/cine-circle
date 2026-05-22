'use client';

import { twMerge } from '@/lib/cn';
import { forwardRef } from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  variant?: 'search' | 'rating';
  className?: string;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      id,
      handleChange,
      type = 'text',
      variant,
      className,
      handleKeyDown,
      placeholder,
      error,
      ...rest
    },
    ref,
  ) => {
    return (
      <>
        <div className="relative w-full">
          <input
            type={type}
            id={id}
            className={twMerge(
              'h-11.5 rounded-xl bg-bg2 border border-white/[0.07] pl-4 pr-4 w-full outline-none text-sm text-primary transition-colors placeholder:text-dim focus:border-mint focus:bg-bg3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              className,
            )}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            ref={ref}
            {...rest}
          />
          {variant === 'rating' && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-dim text-sm">
              /10
            </div>
          )}
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </>
    );
  },
);

Input.displayName = 'Input';

export default Input;
