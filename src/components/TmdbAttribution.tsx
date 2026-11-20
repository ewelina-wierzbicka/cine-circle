import Image from 'next/image';
import { twMerge } from '@/lib/cn';

const TMDB_ATTRIBUTION =
  'This product uses TMDB and the TMDB APIs but is not endorsed, certified, or otherwise approved by TMDB.';

type Props = {
  className?: string;
};

export function TmdbAttribution({ className }: Props) {
  return (
    <a
      href="https://www.themoviedb.org"
      target="_blank"
      rel="noopener noreferrer"
      className={twMerge('flex items-start gap-3 group', className)}
      aria-label={`TMDB — ${TMDB_ATTRIBUTION}`}
    >
      <Image
        src="/tmdb.svg"
        alt="TMDB"
        width={75}
        height={10}
        className="shrink-0 mt-1.5"
      />
      <span className="text-sm text-secondary group-hover:text-primary transition-colors">
        {TMDB_ATTRIBUTION}
      </span>
    </a>
  );
}
