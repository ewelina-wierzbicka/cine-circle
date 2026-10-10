import Skeleton from '@/components/Skeleton';

export function MediaActionsSkeleton() {
  return (
    <div
      className="flex gap-2.5 flex-col md:flex-row"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-12 w-full sm:w-44 rounded-xl" />
      <Skeleton className="h-12 w-full sm:w-36 rounded-xl" />
    </div>
  );
}

export default MediaActionsSkeleton;
