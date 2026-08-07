import Skeleton from '@/components/Skeleton';

export function RecentWatchedSkeleton() {
  return (
    <div className="px-6 md:px-12 pb-8" aria-hidden="true">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex gap-3 overflow-hidden pb-1">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="shrink-0 w-27.5 h-41.25 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default RecentWatchedSkeleton;
