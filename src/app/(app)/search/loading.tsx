import { RouteProgressShell } from '@/components/RouteProgress';
import MediaCardSkeleton from '@/components/MediaCardSkeleton';
import Skeleton from '@/components/Skeleton';

export default function Loading() {
  return (
    <>
      <RouteProgressShell />
      <div className="flex-1 flex flex-col justify-center items-center py-8 px-6 md:px-12">
        <div className="mb-8 w-full max-w-160">
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
        <div className="w-full">
          <div className="mb-8">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-9 w-72" />
          </div>
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <MediaCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
