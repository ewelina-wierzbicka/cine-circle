import { twMerge } from '@/lib/cn';
import { TrendingMovie } from '@/types';
import Image from 'next/image';

type Props = {
  item: TrendingMovie;
  className?: string;
  sizes?: string;
};

export function CinematicPoster({
  item,
  className = '',
  sizes = '(max-width: 1024px) 0px, 20vw',
}: Props) {
  const hasRealPoster = !!item.posterUrl;

  return (
    <div
      className={twMerge(
        'relative overflow-hidden flex flex-col justify-end p-3 bg-dark',
        !hasRealPoster && 'bg-gradient-blue',
        className,
      )}
    >
      {item.posterUrl && (
        <Image
          src={item.posterUrl}
          alt={item.title}
          fill
          className="object-cover"
          sizes={sizes}
        />
      )}
      <div className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none bg-[linear-gradient(to_bottom,rgba(0,0,0,0.35),transparent)]" />
      {!hasRealPoster && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(13,13,16,0.92) 0%, rgba(13,13,16,0.5) 40%, transparent 75%)',
          }}
        />
      )}
      {/* <span className="font-mono text-[10px] tracking-[0.15em] text-mint opacity-80 mb-1 relative z-20 uppercase">
        {item.genre}
      </span>
      <span className="font-serif text-md text-primary leading-[1.15] relative z-20 line-clamp-3 [text-shadow:0_1px_6px_rgba(0,0,0,0.9)]">
        {item.title}
      </span>
      <span className="font-mono text-[10px] text-secondary mt-1 relative z-20">
        {item.year}
      </span> */}
    </div>
  );
}
