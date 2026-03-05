'use client';

import { deleteUserMovie } from '@/services/deleteUserMovie';
import { Movie, SavedMovie } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from './Button';
import MovieCardOverlay from './MovieCardOverlay';
import StarRating from './StarRating';

type Props = {
  movie: (SavedMovie | Movie) & { href: string };
  priority?: boolean;
  userMovieId?: number;
};

export default function MovieCard({
  movie,
  priority = false,
  userMovieId,
}: Props) {
  const { title, release_date, poster_path, href } = movie;
  const rating = 'rating' in movie ? movie.rating : undefined;
  const status = 'status' in movie ? movie.status : undefined;
  const releaseYear = release_date ? release_date.slice(0, 4) : 'N/A';
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!userMovieId) return;
    setIsDeleting(true);
    try {
      await deleteUserMovie(userMovieId);
      await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
      router.refresh();
    } catch {
      setIsDeleting(false);
    }
  };

  const handleMoveToWatched = () => {
    router.push(`${href}?step=2`);
  };

  return (
    <Link href={href} className="w-full flex flex-col justify-end">
      <p className="text-sm md:text-base uppercase font-semibold w-full">
        {title}
      </p>
      <p className="text-sm text-secondary mt-1">{releaseYear}</p>
      {status === 'watched' && rating != null && <StarRating rating={rating} />}
      <div className="w-full aspect-3/4 relative mt-2 group overflow-hidden">
        <Image
          style={{ objectFit: 'cover', objectPosition: 'top center' }}
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
        {userMovieId && (
          <>
            {status === 'to_watch' && (
              <MovieCardOverlay>
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
              </MovieCardOverlay>
            )}
            {status === 'watched' && (
              <MovieCardOverlay>
                <Button
                  handleClick={() => router.push(href)}
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
              </MovieCardOverlay>
            )}
          </>
        )}
      </div>
    </Link>
  );
}
