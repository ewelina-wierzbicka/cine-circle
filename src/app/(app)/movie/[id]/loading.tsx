import MediaDetailSkeleton from '@/components/MediaDetailSkeleton';
import { RouteProgressShell } from '@/components/RouteProgress';

export default function Loading() {
  return (
    <>
      <RouteProgressShell />
      <MediaDetailSkeleton />
    </>
  );
}
