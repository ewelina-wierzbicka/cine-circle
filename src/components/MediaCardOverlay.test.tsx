import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MediaCardOverlay from '@/components/MediaCardOverlay';
import { resetNavigation, router } from '@/test/navigation';

vi.mock('next/navigation', () => import('@/test/navigation'));

afterEach(resetNavigation);

describe('MediaCardOverlay', () => {
  it('pushes the href on click', () => {
    render(
      <MediaCardOverlay href="/movie/550-fight-club?tab=watched">
        <span>overlay content</span>
      </MediaCardOverlay>,
    );
    fireEvent.click(screen.getByText('overlay content'));
    expect(router.push).toHaveBeenCalledWith(
      '/movie/550-fight-club?tab=watched',
    );
  });
});
