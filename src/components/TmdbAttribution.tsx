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
      className={twMerge(
        'flex items-start gap-3 opacity-80 transition-opacity hover:opacity-100',
        className,
      )}
      aria-label={`TMDB — ${TMDB_ATTRIBUTION}`}
    >
      <Image
        src="/tmdb.svg"
        alt="TMDB"
        width={60}
        height={8}
        className="shrink-0 mt-2"
      />
      <span className="text-sm text-secondary">{TMDB_ATTRIBUTION}</span>
    </a>
  );
}
