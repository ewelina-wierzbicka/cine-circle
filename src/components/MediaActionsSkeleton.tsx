import Skeleton from '@/components/Skeleton';

// Suspense fallback for `MediaActions`. Text-free on purpose: the TMDB copy
// now renders once outside the boundary, so the fallback must add no markup a
// crawler could read as a duplicate of it.
export function MediaActionsSkeleton() {
  return (
    <div
      className="flex gap-2.5 flex-col md:flex-row"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-12 w-full sm:w-44 rounded-xl" />
      <Skeleton className="h-12 w-full sm:w-36 rounded-xl" />
    </div>
  );
}

export default MediaActionsSkeleton;
