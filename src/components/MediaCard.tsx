'use client';

import { addUserMedia } from '@/services/addUserMedia';
import { deleteUserMedia } from '@/services/deleteUserMedia';
import { NormalizedMedia, SavedMedia } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MouseEvent, useState } from 'react';
import { toast } from 'react-toastify';
import Button from './Button';
import MediaCardOverlay from './MediaCardOverlay';
import MediaPoster from './MediaPoster';
import StarRating from './StarRating';

type Props = {
  media: (SavedMedia | NormalizedMedia) & { href: string };
  priority?: boolean;
  userMediaId?: number;
  isAuthenticated?: boolean;
};

export default function MediaCard({
  media,
  priority = false,
  userMediaId,
  isAuthenticated = true,
}: Props) {
  const {
    id,
    title,
    release_date,
    last_air_date,
    poster_path,
    href,
    media_type,
  } = media;
  const rating = 'rating' in media ? media.rating : undefined;
  const watchStatus = 'watchStatus' in media ? media.watchStatus : undefined;
  const releaseYear = release_date ? release_date.slice(0, 4) : 'N/A';
  const lastAirYear = last_air_date ? last_air_date.slice(0, 4) : undefined;
  const dateDisplay = lastAirYear
    ? `${releaseYear} – ${lastAirYear}`
    : releaseYear;
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!userMediaId) return;
    setIsDeleting(true);
    try {
      await deleteUserMedia(userMediaId);
      await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
      router.refresh();
    } catch (err) {
      toast.error(
        (err as Error).message || 'Failed to delete. Please try again.',
      );
      setIsDeleting(false);
    }
  };

  const handleAddToToWatch = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsSaving(true);
    try {
      const result = await addUserMedia(
        {
          id,
          title,
          release_date,
          last_air_date,
          poster_path,
          media_type,
        },
        { watchStatus: 'to_watch' },
      );
      await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
      if (result.status === 'duplicate') {
        toast.info(`"${title}" is already in your list.`);
      } else {
        toast.success(`"${title}" saved to your "to watch" list!`);
        router.push('/collection?tab=to_watch');
      }
    } catch (err) {
      toast.error(
        (err as Error).message || 'Failed to save. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToWatched = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const separator = href.includes('?') ? '&' : '?';
    router.push(`${href}${separator}step=2`);
  };

  const handleSeeDetails = () => {
    router.push(href);
  };

  return (
    <div className="group w-full flex flex-col gap-2.5 hover:-translate-y-1.25 transition-transform duration-220 ease-[cubic-bezier(.22,.68,0,1.2)] mb-3">
      <div className="relative rounded-xl overflow-hidden group-hover:border group-hover:border-mint transition-colors duration-200 aspect-2/3">
        <Link href={href} className="absolute inset-0" tabIndex={-1}>
          <MediaPoster
            title={title}
            src={
              poster_path
                ? `https://image.tmdb.org/t/p/w342${poster_path}`
                : undefined
            }
            sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 25vw, (max-width: 1279px) 20vw, 16vw"
            priority={priority}
          />
        </Link>
        {!userMediaId && !isAuthenticated && (
          <MediaCardOverlay href={href}>
            <Button
              handleClick={() => router.push(`/login?rurl=${pathname}`)}
              size="small"
              variant="outlined"
            >
              Sign in to add to collection
            </Button>
          </MediaCardOverlay>
        )}
        {!userMediaId && isAuthenticated && (
          <MediaCardOverlay href={href}>
            <Button
              handleClick={handleAddToWatched}
              size="small"
              variant="outlined"
            >
              I watched
            </Button>
            <Button
              handleClick={handleAddToToWatch}
              disabled={isSaving}
              size="small"
              variant="outlined"
            >
              {isSaving ? 'Saving...' : 'I want to watch'}
            </Button>
          </MediaCardOverlay>
        )}
        {userMediaId && watchStatus === 'to_watch' && (
          <MediaCardOverlay href={href}>
            <Button
              handleClick={handleAddToWatched}
              size="small"
              variant="outlined"
            >
              Move to watched
            </Button>
            <Button
              handleClick={handleDelete}
              disabled={isDeleting}
              size="small"
              variant="outlined"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </MediaCardOverlay>
        )}
        {userMediaId && watchStatus === 'watched' && (
          <MediaCardOverlay href={href}>
            <Button
              handleClick={handleSeeDetails}
              size="small"
              variant="outlined"
            >
              See details
            </Button>
            <Button
              handleClick={handleDelete}
              disabled={isDeleting}
              size="small"
              variant="outlined"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          </MediaCardOverlay>
        )}
      </div>
      <div className="px-0.5">
        <Link href={href}>
          <p className="text-sm font-medium text-primary leading-snug line-clamp-2">
            {title}
          </p>
          <p className="text-sm text-secondary mt-0.5">{dateDisplay}</p>
        </Link>
        {watchStatus === 'watched' && rating != null && (
          <div className="mt-1.5">
            <StarRating rating={rating} />
          </div>
        )}
      </div>
    </div>
  );
}
