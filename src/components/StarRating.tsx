'use client';

import StarIcon from '@/icons/Star';

type Props = {
  rating: number;
  className?: string;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const StarRating = ({ rating, className }: Props) => {
  const fiveScale = rating / 2;

  return (
    <div
      className={`flex items-center gap-0.5 ${className ?? ''}`}
      aria-label={`Rating: ${fiveScale} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = clamp(fiveScale - i, 0, 1);
        const width = `${fill * 100}%`;

        return (
          <div key={i} className="relative h-4 w-4">
            <StarIcon filled className="h-4 w-4 text-zinc-200" />
            <div className="absolute inset-0 overflow-hidden" style={{ width }}>
              <StarIcon filled className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
