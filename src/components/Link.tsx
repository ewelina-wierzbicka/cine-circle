import NextLink from 'next/link';
import { ComponentProps } from 'react';
import { twMerge } from '@/lib/cn';

type Props = ComponentProps<typeof NextLink>;

export function Link({ className, ...props }: Props) {
  return (
    <NextLink
      className={twMerge(
        'text-mint hover:opacity-80 transition-opacity',
        className,
      )}
      {...props}
    />
  );
}
