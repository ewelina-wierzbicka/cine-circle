import { twMerge } from '@/lib/cn';
import Image from 'next/image';

type Props = {
  title: string;
  posterPath?: string;
  className?: string;
};

export default function MediaPoster({
  title,
  posterPath,
  className = '',
}: Props) {
  return (
    <div
      className={twMerge(
        'relative w-full max-w-120 aspect-2/3 rounded-2xl overflow-hidden -rotate-[1.5deg] origin-center shadow-[rgba(0,0,0,0.8)_0px_40px_100px,rgba(255,255,255,0.07)_0px_0px_0px_1px]',
        !posterPath && 'bg-gradient-blue',
        className,
      )}
    >
      {posterPath && (
        <Image
          className="object-cover object-top"
          fill={true}
          src={`https://image.tmdb.org/t/p/w780${posterPath}`}
          sizes="(max-width: 767px) 340px, 480px"
          alt={title}
        />
      )}
      <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.25)]" />
    </div>
  );
}
