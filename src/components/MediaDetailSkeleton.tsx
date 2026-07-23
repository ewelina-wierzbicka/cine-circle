import Skeleton from '@/components/Skeleton';

export function MediaDetailSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden bg-dark min-h-full">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(at_25%_35%,rgb(26,58,92)_0%,rgba(26,58,92,0.333)_35%,rgb(13,13,16)_68%)]" />
        <div className="absolute inset-0 z-1 bg-[linear-gradient(rgba(13,13,16,0.55)_0%,rgba(13,13,16,0.1)_40%,rgba(13,13,16,0.75)_100%)]" />
      </div>
      <div className="relative z-2 flex flex-col md:flex-row flex-1">
        <div className="flex h-[50vh] md:h-auto md:w-1/2 shrink-0 items-center justify-center py-12 px-6 md:px-12 pr-4">
          <Skeleton className="aspect-2/3 w-auto md:w-full h-full md:h-auto max-w-120 rounded-2xl -rotate-[1.5deg] origin-center" />
        </div>
        <div className="flex-1 flex flex-col justify-center py-12 px-6 md:pl-6 lg:pl-12 overflow-y-auto">
          <div className="flex flex-col w-full md:max-w-120">
            <Skeleton className="h-4 w-44 mb-9 self-start" />
            <div className="flex flex-wrap gap-2 mb-4">
              <Skeleton className="h-7 w-16 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-14 rounded-full" />
            </div>
            <Skeleton className="h-4 w-20 mb-4" />
            <Skeleton className="h-16 w-3/4 mb-5" />
            <div className="flex items-center gap-5 mb-7">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-1 w-1 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="w-12 h-px mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-8" />
            <div className="flex gap-2.5 flex-col md:flex-row">
              <Skeleton className="h-12 rounded-xl flex-1" />
              <Skeleton className="h-12 rounded-xl flex-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaDetailSkeleton;
