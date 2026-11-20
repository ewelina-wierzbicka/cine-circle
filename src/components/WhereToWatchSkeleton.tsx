import Skeleton from '@/components/Skeleton';

export function WhereToWatchSkeleton() {
  return (
    <div className="mt-8" aria-busy="true" aria-live="polite">
      <Skeleton className="h-5 w-40 mb-4" />
      <Skeleton className="h-5 w-16 mb-2" />
      <div className="flex gap-2">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
    </div>
  );
}

export default WhereToWatchSkeleton;
