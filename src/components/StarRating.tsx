import StarIcon from '@/icons/Star';
import { twMerge } from '@/lib/cn';

type Props = {
  rating: number;
  className?: string;
};

export default function StarRating({ rating, className }: Props) {
  const raw = rating / 2;
  const fullStars = Math.floor(raw);
  const hasHalf = raw % 1 !== 0;

  return (
    <div
      className={twMerge('flex items-center gap-0.5', className)}
      aria-label={`Rating: ${raw} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < fullStars;
        const isHalf = i === fullStars && hasHalf;

        if (isHalf) {
          return (
            <div key={i} className="relative size-5">
              <StarIcon className="absolute size-5 text-white/15" />
              <div className="absolute w-[50%] overflow-hidden">
                <StarIcon className="size-5 text-amber-400" filled />
              </div>
            </div>
          );
        }

        return (
          <StarIcon
            key={i}
            filled={isFull}
            className={twMerge(
              'size-5',
              isFull ? 'text-amber-400' : 'text-white/15',
            )}
          />
        );
      })}
    </div>
  );
}
