import { twMerge } from '@/lib/cn';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
  className?: string;
  priority?: boolean;
};

export function Logo({ className, priority = false }: Props) {
  return (
    <Link href="/" className={twMerge('flex items-center gap-2.5', className)}>
      <Image
        src="/logo.webp"
        alt="MidnightFrame logo"
        width={200}
        height={50}
        className="object-contain"
        priority={priority}
      />
    </Link>
  );
}
