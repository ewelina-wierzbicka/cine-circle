import Skeleton from '@/components/Skeleton';

export function MediaCardSkeleton() {
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

export default MediaCardSkeleton;
