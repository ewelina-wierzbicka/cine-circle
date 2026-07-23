import Skeleton from '@/components/Skeleton';

export function UserEntryFormSkeleton() {
  return (
    <div className="w-full py-4 animate-fade-up">
      <Skeleton className="h-11 w-72 rounded-xl mb-10" />
      <div className="flex flex-col gap-7 max-w-full md:max-w-140">
        <div>
          <Skeleton className="h-4 w-44 my-3" />
          <Skeleton className="h-11.5 rounded-xl" />
        </div>
        <div>
          <Skeleton className="h-4 w-36 my-3" />
          <Skeleton className="h-8 w-44" />
        </div>
        <div>
          <Skeleton className="h-4 w-28 my-3" />
          <Skeleton className="h-30 rounded-xl" />
        </div>
        <div className="pt-6">
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default UserEntryFormSkeleton;
