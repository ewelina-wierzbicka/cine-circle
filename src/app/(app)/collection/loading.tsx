import MediaCardSkeleton from '@/components/MediaCardSkeleton';
import Skeleton from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-full px-6 md:px-10 lg:px-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-10 pb-12">
        <div className="w-full sm:w-[25%]">
          <Skeleton className="h-4 w-28 mb-2" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="flex items-center justify-end gap-2.5 shrink-0 flex-wrap w-full sm:w-[75%]">
          <Skeleton className="h-9 w-full sm:w-44 rounded-xl" />
          <div className="flex gap-2.5 w-full sm:w-auto flex-wrap justify-end">
            <Skeleton className="h-10 w-full sm:w-53.25 rounded-xl" />
            <Skeleton className="h-10 w-full sm:w-53.25 rounded-xl" />
          </div>
        </div>
      </div>
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
