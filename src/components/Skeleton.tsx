import { twMerge } from '@/lib/cn';

type Props = {
  className?: string;
};

export function Skeleton({ className }: Props) {
  return (
    <div
      aria-hidden="true"
      className={twMerge('animate-pulse rounded-md bg-bg3/60', className)}
    />
  );
}

export default Skeleton;
