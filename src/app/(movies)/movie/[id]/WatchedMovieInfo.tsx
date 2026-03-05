import Button from '@/components/Button';
import StarRating from '@/components/StarRating';
import { Movie, UserEntry } from '@/types';

type Props = {
  movie: Movie;
  userEntry: Pick<UserEntry, 'watched_date' | 'rating' | 'review'>;
  onEdit: () => void;
  isTablet: boolean;
};

export default function WatchedMovieInfo({
  movie,
  userEntry,
  onEdit,
  isTablet,
}: Props) {
  const { title, director, release_date } = movie;
  const { watched_date, rating, review } = userEntry;
  const isUserEntry = watched_date && rating != null && review;
  const releaseYear = release_date ? release_date.slice(0, 4) : 'N/A';

  const formattedDate = watched_date
    ? new Date(watched_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div
      className={`flex flex-wrap justify-between w-full h-1/2 md:h-full ${isUserEntry ? 'md:min-h-[calc(100vh-240px)]' : 'md:min-h-[calc(50vh-120px)]'} -mt-30 md:mt-0 z-50`}
    >
      <div className="w-full">
        <p
          className={`${title.length > 35 ? 'text-4xl' : 'text-5xl'} sm:text-5xl font-bold uppercase`}
        >
          {title}
        </p>

        <p className="text-sm text-secondary mt-8 pt-2 border-t border-primary min-w-40 w-max max-w-full">
          dir.: {director}
        </p>
        <p className="text-sm text-secondary mt-1">{releaseYear}</p>
      </div>
      <div className="mt-8 flex flex-col gap-8 w-full">
        {formattedDate && (
          <div>
            <p className="text-secondary uppercase tracking-widest mb-1">
              Watched
            </p>
            <p className="text-base">{formattedDate}</p>
          </div>
        )}

        {rating != null && (
          <div>
            <p className="text-secondary uppercase tracking-widest mb-1">
              Rating
            </p>
            <div className="flex items-center gap-3">
              <StarRating rating={rating} />
              <span>{rating}/10</span>
            </div>
          </div>
        )}

        {review && (
          <div>
            <p className="text-secondary uppercase tracking-widest mb-1">
              What do you think?
            </p>
            <p className="leading-relaxed whitespace-pre-wrap text-justify">
              {review}
            </p>
          </div>
        )}
      </div>

      <div className="w-full sm:w-3/4 flex justify-center flex-col mt-auto mx-auto pt-8 pb-4 md:pb-0">
        <Button
          text="UPDATE"
          size={isTablet ? 'small' : 'medium'}
          handleClick={onEdit}
        />
      </div>
    </div>
  );
}
