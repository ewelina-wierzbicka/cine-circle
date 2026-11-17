import { twMerge } from '@/lib/cn';
import Link from 'next/link';
import { ComponentProps, ReactNode } from 'react';

type Props = {
  href: ComponentProps<typeof Link>['href'];
  children: ReactNode;
  className?: string;
};

export function BackLink({ href, children, className }: Props) {
  return (
    <Link
      href={href}
      className={twMerge(
        'inline-flex items-center gap-2 label-mono text-secondary hover:text-accent transition-colors duration-150 mb-9 self-start',
        className,
      )}
    >
      <span aria-hidden="true">←</span>
      {children}
    </Link>
  );
}
