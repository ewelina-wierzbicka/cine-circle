import { twMerge } from '@/lib/cn';
import Image from 'next/image';

type Props = {
  title: string;
  posterPath?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  imageWidth?: string;
  sizes?: string;
  priority?: boolean;
  rotate?: boolean;
  shadow?: boolean;
  innerShadow?: boolean;
};

export default function MediaPoster({
  title,
  posterPath,
  className = '',
  fill = true,
  width,
  height,
  imageWidth = 'w780',
  sizes = '(max-width: 767px) 340px, 480px',
  priority = false,
  rotate = true,
  shadow = true,
  innerShadow = true,
}: Props) {
  return (
    <div
      className={twMerge(
        'relative overflow-hidden',
        fill && 'w-full max-w-120 aspect-2/3',
        rotate && '-rotate-[1.5deg] origin-center',
        'rounded-2xl',
        !posterPath && 'bg-gradient-blue',
        className,
      )}
      style={
        shadow
          ? {
              boxShadow:
                'rgba(0, 0, 0, 0.8) 0px 40px 100px, rgba(255, 255, 255, 0.07) 0px 0px 0px 1px',
            }
          : undefined
      }
    >
      {!posterPath && (
        <div
          className="absolute inset-0 h-1/2"
          style={{
            background: 'linear-gradient(rgba(0, 0, 0, 0.25), transparent)',
          }}
        />
      )}
      {posterPath && (
        <Image
          className="object-cover object-top"
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          src={`https://image.tmdb.org/t/p/${imageWidth}${posterPath}`}
          sizes={fill ? sizes : undefined}
          alt={title}
          priority={priority}
        />
      )}
      {innerShadow && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.25)' }}
        />
      )}
    </div>
  );
}
