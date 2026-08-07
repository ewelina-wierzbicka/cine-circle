import Skeleton from '@/components/Skeleton';

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-xl px-6 py-10 md:py-16 min-h-full flex flex-col justify-center">
      <div className="h-12 w-44 mb-8">
        <Skeleton className="h-12 w-44 rounded-md" />
      </div>
      <div className="bg-bg2 border border-secondary/25 rounded-2xl p-6 mb-4 flex flex-col sm:flex-row items-center gap-6">
        <Skeleton className="w-22 h-22 rounded-full shrink-0" />
        <div className="flex-1 w-full">
          <Skeleton className="h-4 w-28 mb-3" />
          <Skeleton className="h-7 w-40" />
        </div>
      </div>
      <div className="bg-bg2 border border-white/[0.07] rounded-2xl p-6 mb-4">
        <Skeleton className="h-5 w-24 mb-6" />
        <div className="border-b border-white/[0.07] pb-4 mb-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="bg-bg2 border border-error/20 rounded-2xl p-6 mb-8">
        <Skeleton className="h-5 w-28 mb-6" />
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      <div className="flex justify-center">
        <Skeleton className="h-12 w-full sm:w-48 rounded-xl" />
      </div>
    </div>
  );
}
