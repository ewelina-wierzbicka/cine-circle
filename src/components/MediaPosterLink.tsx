import MediaPoster from '@/components/MediaPoster';
import NextLink from 'next/link';

type Props = {
  href: string;
  title: string;
  src?: string;
  genre?: string;
  showTitle?: boolean;
};

export function MediaPosterLink({
  href,
  title,
  src,
  genre,
  showTitle = false,
}: Props) {
  return (
    <NextLink href={href} className="shrink-0 group">
      <div className="relative rounded-xl overflow-hidden border border-white/[0.07] w-27.5 h-41.25">
        <MediaPoster
          title={title}
          src={src}
          className="w-full h-full max-w-none rounded-xl"
          sizes="110px"
        />
        {genre && (
          <span className="absolute bottom-1.5 left-1.5 font-mono text-sm tracking-[0.06em] uppercase bg-dark/70 text-accent px-1.5 py-0.5 rounded-full">
            {genre}
          </span>
        )}
      </div>
      {showTitle && (
        <p className="text-sm text-secondary mt-1.5 w-27.5 truncate group-hover:text-primary transition-colors">
          {title}
        </p>
      )}
    </NextLink>
  );
}
