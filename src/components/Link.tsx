import NextLink from 'next/link';
import { twMerge } from '@/lib/cn';

type Props = {
  href: string;
  className?: string;
  children?: React.ReactNode;
};

export function Link({ href, className, children }: Props) {
  return (
    <NextLink
      href={href}
      className={twMerge(
        'text-mint hover:opacity-80 transition-opacity',
        className,
      )}
    >
      {children}
    </NextLink>
  );
}
