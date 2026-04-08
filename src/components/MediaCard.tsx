'use client';

import { deleteUserMedia } from '@/services/deleteUserMedia';
import { NormalizedMedia, SavedMedia } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from './Button';
import MediaCardOverlay from './MediaCardOverlay';
import StarRating from './StarRating';
import { toast } from 'react-toastify';

type Props = {
  media: (SavedMedia | NormalizedMedia) & { href: string };
  priority?: boolean;
  userMediaId?: number;
};

export default function MediaCard({
  media,
  priority = false,
  userMediaId,
}: Props) {
  const { title, release_date, last_air_date, poster_path, href } = media;
  const rating = 'rating' in media ? media.rating : undefined;
  const watchStatus = 'watchStatus' in media ? media.watchStatus : undefined;
  const releaseYear = release_date ? release_date.slice(0, 4) : 'N/A';
  const lastAirYear = last_air_date ? last_air_date.slice(0, 4) : undefined;
  const dateDisplay = lastAirYear
    ? `${releaseYear} – ${lastAirYear}`
    : releaseYear;
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
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

  const handleMoveToWatched = () => {
    router.push(`${href}?step=2`);
  };

  const handleSeeDetails = () => {
    router.push(href);
  };

  return (
    <div className="w-full flex flex-col justify-end">
      <Link href={href}>
        <p className="text-sm md:text-base uppercase font-semibold w-full">
          {title}
        </p>
        <p className="text-sm text-secondary mt-1">{dateDisplay}</p>
        {watchStatus === 'watched' && rating != null && (
          <StarRating rating={rating} />
        )}
      </Link>
      <div className="w-full aspect-3/4 relative mt-2 group overflow-hidden">
        <Link href={href} className="absolute inset-0">
          <Image
            className="object-cover object-top-center"
            fill={true}
            src={
              poster_path
                ? `https://image.tmdb.org/t/p/w342${poster_path}`
                : '/no-image.jpg'
            }
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1280px) 25vw, 16vw"
            alt={title}
            priority={priority}
          />
        </Link>
        {userMediaId && (
          <>
            {watchStatus === 'to_watch' && (
              <MediaCardOverlay>
                <Button
                  handleClick={handleMoveToWatched}
                  size="small"
                  variant="outlined"
                  className="text-xs md:text-sm"
                  text="Move to watched"
                />
                <Button
                  handleClick={handleDelete}
                  disabled={isDeleting}
                  size="small"
                  variant="outlined"
                  className="text-xs md:text-sm"
                  text={isDeleting ? 'Deleting...' : 'Delete'}
                />
              </MediaCardOverlay>
            )}
            {watchStatus === 'watched' && (
              <MediaCardOverlay>
                <Button
                  handleClick={handleSeeDetails}
                  size="small"
                  variant="outlined"
                  className="text-xs md:text-sm"
                  text="See details"
                />
                <Button
                  handleClick={handleDelete}
                  disabled={isDeleting}
                  size="small"
                  variant="outlined"
                  className="text-xs md:text-sm"
                  text={isDeleting ? 'Deleting...' : 'Delete'}
                />
              </MediaCardOverlay>
            )}
          </>
        )}
      </div>
    </div>
  );
}
