import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MediaPosterLink } from '@/components/MediaPosterLink';
import { tmdbImageUrl } from '@/lib/tmdbImage';

describe('MediaPosterLink', () => {
  it('links the poster, genre and title to the href', () => {
    render(
      <MediaPosterLink
        href="/series/1399-game-of-thrones"
        title="Game of Thrones"
        src={tmdbImageUrl('/got.jpg')}
        genre="Drama"
        showTitle
      />,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/series/1399-game-of-thrones');
    expect(link).toContainElement(
      screen.getByRole('img', { name: 'Game of Thrones' }),
    );
    expect(link).toHaveTextContent('Drama');
    expect(link).toHaveTextContent('Game of Thrones');
  });
});
