'use client';

import { FieldError } from '@/components/FieldError';
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
    const errorId = `${id}-error`;

    return (
      <>
        <textarea
          id={id}
          className={twMerge(
            'h-30 rounded-xl p-4 bg-bg2 border border-secondary/25 pl-4 pr-4 w-full outline-none text-sm text-primary transition-colors placeholder:text-secondary focus:border-accent focus:bg-bg3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            className,
          )}
          onChange={handleChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          ref={ref}
          {...rest}
        />
        <FieldError id={errorId} error={error} />
      </>
    );
  },
);

Textarea.displayName = 'Textarea';

export default Textarea;
