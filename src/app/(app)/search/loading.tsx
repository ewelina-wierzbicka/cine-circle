import Skeleton from '@/components/Skeleton';

function MediaCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 mb-3">
      <Skeleton className="aspect-2/3 w-full rounded-xl" />
      <div className="px-0.5">
        <Skeleton className="h-3.5 w-full mb-1" />
        <Skeleton className="h-3.5 w-1/2" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
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
  );
}
