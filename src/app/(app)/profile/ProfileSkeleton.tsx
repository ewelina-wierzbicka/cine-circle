import Skeleton from '@/components/Skeleton';

export function ProfileSkeleton() {
  return (
    <div className="mx-auto my-auto min-w-full sm:min-w-150 px-6 py-10 md:py-16 flex flex-col">
      <Skeleton className="h-12 w-44 mb-8" />
      <Skeleton className="w-full sm:w-132 h-56.5 sm:h-34.5 mb-4 rounded-2xl" />
      <Skeleton className="w-full sm:w-132 h-56.75 mb-4" rounded-2xl />
      <Skeleton className="w-full sm:w-132 h-38.5 mb-8" rounded-2xl />
      <div className="flex justify-center">
        <Skeleton className="h-12.5 w-full sm:w-37.5 rounded-xl" />
      </div>
    </div>
  );
}
