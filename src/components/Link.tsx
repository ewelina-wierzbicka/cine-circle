import { twMerge } from '@/lib/cn';
import NextLink from 'next/link';
import { ComponentProps } from 'react';

type Props = ComponentProps<typeof NextLink>;

export function Link({ className, ...props }: Props) {
  return (
    <NextLink
      className={twMerge(
        'text-accent hover:opacity-80 transition-opacity',
        className,
      )}
      {...props}
    />
  );
}
