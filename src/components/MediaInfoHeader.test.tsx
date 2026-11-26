import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MediaInfoHeader from '@/components/MediaInfoHeader';
import type { NormalizedMedia } from '@/types';

const movie: NormalizedMedia = {
  id: 550,
  title: 'Fight Club',
  media_type: 'movie',
  release_date: '1999-10-15',
  director: 'David Fincher',
};

const series: NormalizedMedia = {
  id: 1399,
  title: 'Game of Thrones',
  media_type: 'series',
  release_date: '2011-04-17',
  director: 'David Benioff',
};

describe('MediaInfoHeader', () => {
  it.each([
    [142, '2h 22m'],
    [60, '1h'],
    [45, '45m'],
  ])('formats a movie runtime of %i as %s', (runtime, text) => {
    render(<MediaInfoHeader media={{ ...movie, runtime }} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('shows a series runtime per episode', () => {
    render(<MediaInfoHeader media={{ ...series, runtime: 50 }} />);
    expect(screen.getByText('avg 50m / episode')).toBeInTheDocument();
  });

  it('labels a series CREATED BY and SERIES', () => {
    render(<MediaInfoHeader media={series} />);
    expect(screen.getByText('CREATED BY')).toBeInTheDocument();
    expect(screen.getByText('SERIES')).toBeInTheDocument();
    expect(screen.queryByText('DIR.')).not.toBeInTheDocument();
  });

  it('labels a movie DIR. and MOVIE', () => {
    render(<MediaInfoHeader media={movie} />);
    expect(screen.getByText('DIR.')).toBeInTheDocument();
    expect(screen.getByText('MOVIE')).toBeInTheDocument();
    expect(screen.queryByText('CREATED BY')).not.toBeInTheDocument();
  });

  it('shows a year range with a last_air_date', () => {
    render(
      <MediaInfoHeader
        media={{
          ...series,
          release_date: '2019-01-01',
          last_air_date: '2024-05-01',
        }}
      />,
    );
    expect(screen.getByText('2019 – 2024')).toBeInTheDocument();
  });

  it('shows N/A with neither date', () => {
    render(<MediaInfoHeader media={{ ...movie, release_date: undefined }} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('pluralises seasons and episodes', () => {
    const { rerender } = render(
      <MediaInfoHeader
        media={{ ...series, number_of_seasons: 1, number_of_episodes: 1 }}
      />,
    );
    expect(screen.getByText('1 season')).toBeInTheDocument();
    expect(screen.getByText('1 episode')).toBeInTheDocument();

    rerender(
      <MediaInfoHeader
        media={{ ...series, number_of_seasons: 2, number_of_episodes: 2 }}
      />,
    );
    expect(screen.getByText('2 seasons')).toBeInTheDocument();
    expect(screen.getByText('2 episodes')).toBeInTheDocument();
  });

  it.each([0, undefined])('hides the runtime row for runtime %j', (runtime) => {
    render(<MediaInfoHeader media={{ ...movie, runtime }} />);
    expect(screen.queryByText(/^\d+h|\d+m$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/episode/)).not.toBeInTheDocument();
  });

  it('rounds the TMDB score to one decimal', () => {
    render(<MediaInfoHeader media={{ ...movie, vote_average: 8.437 }} />);
    expect(screen.getByText('8.4')).toBeInTheDocument();
    expect(screen.getByText('avg on TMDB')).toBeInTheDocument();
  });

  it.each([0, undefined])('hides the TMDB score for %j', (vote_average) => {
    render(<MediaInfoHeader media={{ ...movie, vote_average }} />);
    expect(screen.queryByText('avg on TMDB')).not.toBeInTheDocument();
  });

  it('hides a vote count of 0', () => {
    render(
      <MediaInfoHeader media={{ ...movie, vote_average: 7, vote_count: 0 }} />,
    );
    expect(screen.queryByText(/^\(.*\)$/)).not.toBeInTheDocument();
  });

  it('renders exactly one h1', () => {
    render(
      <MediaInfoHeader
        media={{
          ...series,
          overview: 'Overview',
          genres: [{ id: 1, name: 'Drama' }],
        }}
      />,
    );
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Game of Thrones');
  });
});
