import { Movie, SavedMovieType } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import StarRating from './StarRating';

type Props = {
  movie: (SavedMovieType | Movie) & { href: string };
  priority?: boolean;
};

const MovieCard: FC<Props> = ({ movie, priority = false }) => {
  const { title, release_date, poster_path, href } = movie;
  const rating = 'rating' in movie ? movie.rating : undefined;
  const status = 'status' in movie ? movie.status : undefined;
  const releaseYear = release_date ? release_date.slice(0, 4) : 'N/A';

  return (
    <Link href={href} className="w-full flex flex-col justify-end">
      <p className="text-sm md:text-base uppercase font-semibold w-full">
        {title}
      </p>
      <p className="text-sm text-secondary mt-1">{releaseYear}</p>
      {status === 'watched' && rating != null && <StarRating rating={rating} />}
      <div className="w-full aspect-3/4 relative mt-2">
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
      </div>
    </Link>
  );
};

export default MovieCard;
