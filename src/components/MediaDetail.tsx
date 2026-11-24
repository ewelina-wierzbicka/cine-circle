import MediaDetailWrapper from '@/components/MediaDetailWrapper';
import MediaInfoHeader from '@/components/MediaInfoHeader';
import { tmdbImageUrl } from '@/lib/tmdbImage';
import { NormalizedMedia } from '@/types';
import { ReactNode } from 'react';

type Props = {
  media: NormalizedMedia;
  navLink?: ReactNode;
  actions: ReactNode;
  whereToWatch?: ReactNode;
  form: ReactNode;
};

export default function MediaDetail({
  media,
  navLink,
  actions,
  whereToWatch,
  form,
}: Props) {
  return (
    <MediaDetailWrapper
      posterSrc={
        media.poster_path ? tmdbImageUrl(media.poster_path) : undefined
      }
      posterTitle={media.title}
      infoSlot={
        <div className="flex flex-col w-full animate-fade-up md:max-w-120">
          {navLink}
          <MediaInfoHeader media={media} />
          {actions}
        </div>
      }
      formSlot={form}
      whereToWatchSlot={whereToWatch}
      recommendations={media.recommendations}
    />
  );
}
