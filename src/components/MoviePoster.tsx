import Image from 'next/image';

type Props = {
  title: string;
  posterPath?: string;
  className?: string;
};

export default function MoviePoster({
  title,
  posterPath,
  className = '',
}: Props) {
  return (
    <div
      className={`h-150 md:h-auto w-full lg:w-[80%] aspect-3/4 relative overflow-hidden rounded-2xl ${className}`}
    >
      <div className="bg-linear-to-b from-transparent via-dark/30 via-30% to-dark to-80% absolute bottom-0 left-0 w-full h-3/4 z-10 pointer-events-none" />
      <Image
        style={{
          objectFit: 'cover',
          objectPosition: 'top center',
        }}
        fill={true}
        src={
          posterPath
            ? `https://image.tmdb.org/t/p/w780${posterPath}`
            : '/no-image.jpg'
        }
        sizes="(max-width: 767px) 701px, (max-width: 1023px) 351px, 586px"
        alt={title}
      />
    </div>
  );
}
