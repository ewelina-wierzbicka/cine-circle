'use client';

import Input from '@/components/Input';
import { EyeIcon } from '@/icons/Eye';
import { EyeOffIcon } from '@/icons/EyeOff';
import { twMerge } from '@/lib/cn';
import { forwardRef, useState } from 'react';

type Props = Omit<
  React.ComponentPropsWithoutRef<typeof Input>,
  'type' | 'variant'
>;

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  ({ className, ...rest }, ref) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <div className="relative w-full">
        <Input
          type={isVisible ? 'text' : 'password'}
          className={twMerge('pr-11', className)}
          ref={ref}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          aria-label={isVisible ? 'Hide password' : 'Show password'}
          aria-pressed={isVisible}
          aria-controls={rest.id}
          className="absolute right-0 top-5.75 -translate-y-1/2 flex h-11.5 w-11 items-center justify-center rounded-xl text-secondary transition-colors hover:text-primary focus-visible:text-accent focus-visible:outline-2 focus-visible:outline-accent/60"
        >
          {isVisible ? (
            <EyeOffIcon className="w-4.5 h-4.5" />
          ) : (
            <EyeIcon className="w-4.5 h-4.5" />
          )}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
