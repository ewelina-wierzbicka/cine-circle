import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MediaDetailSkeleton from '@/components/MediaDetailSkeleton';

// Duplicate-h1 regression guard: a media page once used the real header as
// its Suspense fallback, so crawlers saw every TMDB string twice. A skeleton
// must carry no copy at all.
describe('MediaDetailSkeleton', () => {
  it('renders no heading and no text', () => {
    const { container } = render(<MediaDetailSkeleton />);
    expect(screen.queryAllByRole('heading')).toEqual([]);
    expect(
      container.querySelectorAll('h1, h2, h3, h4, h5, h6, p'),
    ).toHaveLength(0);
    expect(container.textContent?.trim()).toBe('');
  });
});
