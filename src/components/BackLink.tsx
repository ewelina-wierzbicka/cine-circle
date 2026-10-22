import { twMerge } from '@/lib/cn';
import NextLink from 'next/link';
import { ComponentProps, ReactNode } from 'react';

type Props = {
  href: ComponentProps<typeof NextLink>['href'];
  children: ReactNode;
  className?: string;
};

export function BackLink({ href, children, className }: Props) {
  return (
    <NextLink
      href={href}
      className={twMerge(
        'inline-flex items-center gap-2 font-mono text-sm tracking-[0.12em] text-secondary hover:text-accent transition-colors duration-150 mb-9 self-start',
        className,
      )}
    >
      <span aria-hidden="true">←</span>
      {children}
    </NextLink>
  );
}
