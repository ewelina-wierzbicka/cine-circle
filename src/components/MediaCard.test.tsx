import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MediaCard from '@/components/MediaCard';
import { toUserMediaListProps } from '@/lib/mediaUtils';
import { tmdbImageUrl } from '@/lib/tmdbImage';
import { sourceOf } from '@/test/imageSource';
import { resetNavigation } from '@/test/navigation';
import { renderWithQuery } from '@/test/render';
import type { NormalizedMedia, SavedMedia, UserMedia } from '@/types';

vi.mock('next/navigation', () => import('@/test/navigation'));
vi.mock('@/services/addUserMedia', () => ({ addUserMedia: vi.fn() }));
vi.mock('@/services/deleteUserMedia', () => ({ deleteUserMedia: vi.fn() }));

afterEach(resetNavigation);

const media: NormalizedMedia & { href: string } = {
  id: 550,
  title: 'Fight Club',
  media_type: 'movie',
  release_date: '1999-10-15',
  poster_path: '/p.jpg',
  href: '/movie/550-fight-club',
};

function saved(watchStatus: SavedMedia['watchStatus']) {
  return { ...media, tmdb_id: 550, watchStatus, rating: 8 };
}

describe('MediaCard', () => {
  it('renders the title, the year and the poster', () => {
    renderWithQuery(<MediaCard media={media} />);
    expect(screen.getByText('Fight Club')).toBeInTheDocument();
    expect(screen.getByText('1999')).toBeInTheDocument();
    const img = screen.getByRole('img', { name: 'Fight Club' });
    expect(sourceOf(img)).toBe(tmdbImageUrl('/p.jpg'));
  });

  it('renders the placeholder without a poster', () => {
    renderWithQuery(<MediaCard media={{ ...media, poster_path: undefined }} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('offers the watched actions for a watched item', () => {
    renderWithQuery(<MediaCard media={saved('watched')} userMediaId={3} />);
    expect(screen.getByRole('button', { name: 'See details' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Move to watched' }),
    ).not.toBeInTheDocument();
  });

  it('offers the to-watch actions for a to-watch item', () => {
    renderWithQuery(<MediaCard media={saved('to_watch')} userMediaId={3} />);
    expect(
      screen.getByRole('button', { name: 'Move to watched' }),
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'See details' }),
    ).not.toBeInTheDocument();
  });

  it('offers neither for an unsaved item', () => {
    renderWithQuery(<MediaCard media={media} />);
    expect(
      screen.queryByRole('button', { name: 'See details' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Move to watched' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'I watched' })).toBeVisible();
  });

  it('carries ?tab= in the card href when one is given', () => {
    const userMedia: UserMedia = {
      id: 3,
      watchStatus: 'watched',
      media: { tmdb_id: 550, id: 7, title: 'Fight Club', media_type: 'movie' },
    };
    const props = toUserMediaListProps(userMedia, 'watched');
    renderWithQuery(<MediaCard media={props} userMediaId={3} />);

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('href', '/movie/550-fight-club?tab=watched');
    }
  });
});
