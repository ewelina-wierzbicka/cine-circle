'use client';

import Button from '@/components/Button';
import { addUserMedia } from '@/services/addUserMedia';
import { deleteUserMedia } from '@/services/deleteUserMedia';
import { NormalizedMedia } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

type Props = {
  media: NormalizedMedia;
  userMediaId?: number;
  isToWatch?: boolean;
  addToWatched: () => void;
};

export default function MediaInfo({
  media,
  userMediaId,
  isToWatch,
  addToWatched,
}: Props) {
  const {
    id,
    title,
    release_date,
    last_air_date,
    poster_path,
    director,
    media_type,
    genres,
    overview,
  } = media;
  const releaseYear = release_date ? release_date.slice(0, 4) : 'N/A';
  const lastAirYear = last_air_date ? last_air_date.slice(0, 4) : null;
  const dateDisplay = lastAirYear
    ? `${releaseYear} – ${lastAirYear}`
    : releaseYear;
  const dirLabel = media_type === 'series' ? 'CREATED BY' : 'DIR.';
  const typeLabel = media_type === 'series' ? 'SERIES' : 'MOVIE';
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromSearch = searchParams.get('from') === 'search';
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const addToToWatch = async () => {
    setIsSaving(true);
    try {
      const result = await addUserMedia(
        {
          id,
          title,
          release_date,
          last_air_date,
          poster_path,
          director,
          media_type,
        },
        { watchStatus: 'to_watch' },
      );
      await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
      if (result.status === 'duplicate') {
        toast.info(`"${title}" is already in your list.`);
      } else {
        toast.success(`"${title}" saved to your "to watch" list!`);
        router.push('/my-media?tab=to_watch');
      }
    } catch (err) {
      toast.error(
        (err as Error).message || 'Failed to save. Please try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userMediaId) return;
    setIsDeleting(true);
    try {
      await deleteUserMedia(userMediaId);
      await queryClient.invalidateQueries({ queryKey: ['user-movies'] });
      router.push('/my-media?tab=to_watch');
    } catch (err) {
      toast.error(
        (err as Error).message || 'Failed to delete. Please try again.',
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col w-full animate-fade-up max-w-120">
      <Link
        href={fromSearch ? '/' : '/my-media'}
        className="inline-flex items-center gap-2 font-mono text-sm tracking-[0.12em] text-secondary hover:text-mint transition-colors duration-150 mb-9 self-start"
      >
        {fromSearch ? '← BACK TO SEARCH' : '← BACK TO COLLECTION'}
      </Link>
      <p className="font-mono text-xs tracking-[0.22em] text-mint uppercase mb-3.5">
        {typeLabel}
      </p>
      {genres && genres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {genres.map((g) => (
            <span
              key={g.id}
              className="font-mono text-xs tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border border-white/10 text-mint"
            >
              {g.name}
            </span>
          ))}
        </div>
      )}

      <h1
        className="font-serif font-normal tracking-[-0.03em] leading-[0.95] mb-5 text-balance"
        style={{ fontSize: 'clamp(42px, 5.5vw, 72px)' }}
      >
        {title}
      </h1>
      <div className="flex items-center gap-5 mb-7">
        {director && (
          <>
            <span className="text-sm text-secondary">
              <span className="font-mono text-xs tracking-[0.08em] text-secondary mr-2">
                {dirLabel}
              </span>
              {director}
            </span>
            <div className="w-0.75 h-0.75 rounded-full bg-secondary shrink-0" />
          </>
        )}
        <span className="font-mono text-sm tracking-[0.04em] text-secondary">
          {dateDisplay}
        </span>
      </div>
      <div className="mb-8 shrink-0 w-12 h-px bg-mint opacity-60" />
      {overview && (
        <p className="text-sm text-secondary leading-relaxed mb-8">
          {overview}
        </p>
      )}
      <div className="flex gap-2.5 flex-col md:flex-row">
        {isToWatch ? (
          <>
            <Button handleClick={addToWatched} className="flex-1">
              MOVE TO WATCHED
            </Button>
            <Button
              variant="outlined"
              handleClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? 'DELETING…' : 'DELETE'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outlined"
              handleClick={addToToWatch}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? 'SAVING…' : 'I WANT TO WATCH'}
            </Button>
            <Button handleClick={addToWatched} className="flex-1">
              I WATCHED
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
