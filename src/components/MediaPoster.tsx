import { twMerge } from '@/lib/cn';
import Image from 'next/image';

type Props = {
  title: string;
  src?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  rotate?: boolean;
};

export default function MediaPoster({
  title,
  src,
  className = '',
  sizes = '(max-width: 767px) 340px, 500px',
  priority = false,
  rotate = false,
}: Props) {
  return (
    <div
      className={twMerge(
        'relative w-full max-w-120 aspect-2/3 overflow-hidden rounded-2xl',
        rotate && '-rotate-[1.5deg] origin-center',
        !src && 'bg-gradient-blue',
        className,
      )}
      style={{
        boxShadow:
          'rgba(0, 0, 0, 0.8) 0px 40px 100px, rgba(255, 255, 255, 0.07) 0px 0px 0px 1px',
      }}
    >
      {src ? (
        <Image
          className="object-cover object-top"
          fill
          src={src}
          sizes={sizes}
          alt={title}
          priority={priority}
        />
      ) : (
        <div
          className="absolute inset-0 h-1/2"
          style={{
            background: 'linear-gradient(rgba(0, 0, 0, 0.25), transparent)',
          }}
        />
      )}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.25)' }}
      />
    </div>
  );
}
