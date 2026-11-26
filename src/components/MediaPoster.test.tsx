import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MediaPoster from '@/components/MediaPoster';
import { tmdbImageUrl } from '@/lib/tmdbImage';
import { sourceOf } from '@/test/imageSource';

describe('MediaPoster', () => {
  it('renders the given TMDB src', () => {
    render(<MediaPoster title="Fight Club" src={tmdbImageUrl('/p.jpg')} />);
    expect(sourceOf(screen.getByRole('img', { name: 'Fight Club' }))).toBe(
      tmdbImageUrl('/p.jpg'),
    );
  });

  it('renders no image without a src', () => {
    render(<MediaPoster title="Fight Club" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
