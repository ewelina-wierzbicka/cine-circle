'use client';

import { twMerge } from '@/lib/cn';
import { forwardRef } from 'react';

type Props = {
  id: string;
  handleChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  error?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ id, handleChange, className, error, ...rest }, ref) => {
    return (
      <>
        <textarea
          id={id}
          className={twMerge(
            'h-11.5 rounded-xl bg-bg2 border border-white/[0.07] pl-4 pr-4 w-full outline-none text-sm text-primary transition-colors placeholder:text-dim focus:border-mint focus:bg-bg3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            className,
          )}
          onChange={handleChange}
          ref={ref}
          {...rest}
        />
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
