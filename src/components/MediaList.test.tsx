import { act, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MediaList from '@/components/MediaList';
import { resetNavigation } from '@/test/navigation';
import { renderWithQuery } from '@/test/render';
import type { NormalizedMedia } from '@/types';

vi.mock('next/navigation', () => import('@/test/navigation'));
vi.mock('@/services/addUserMedia', () => ({ addUserMedia: vi.fn() }));
vi.mock('@/services/deleteUserMedia', () => ({ deleteUserMedia: vi.fn() }));

// jsdom has no IntersectionObserver. This one lets a test fire the callback.
const observers: { callback: IntersectionObserverCallback }[] = [];

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        observers.push({ callback });
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  resetNavigation();
  vi.unstubAllGlobals();
});

function intersect(isIntersecting = true) {
  const { callback } = observers[observers.length - 1];
  act(() => {
    callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
  });
}

const items: (NormalizedMedia & { href: string })[] = [1, 2, 3].map((id) => ({
  id,
  title: `Title ${id}`,
  media_type: 'movie',
  href: `/movie/${id}-title-${id}`,
}));

describe('MediaList', () => {
  it('renders one card per item', () => {
    renderWithQuery(<MediaList media={items} />);
    for (const item of items) {
      expect(screen.getAllByText(item.title)).toHaveLength(1);
    }
  });

  it('fetches the next page once per intersection', () => {
    const fetchNextPage = vi.fn();
    renderWithQuery(
      <MediaList media={items} hasNextPage fetchNextPage={fetchNextPage} />,
    );

    intersect();
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    intersect(false);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
    intersect();
    expect(fetchNextPage).toHaveBeenCalledTimes(2);
  });

  it('does not fetch when there is no next page', () => {
    const fetchNextPage = vi.fn();
    renderWithQuery(
      <MediaList
        media={items}
        hasNextPage={false}
        fetchNextPage={fetchNextPage}
      />,
    );
    intersect();
    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it('does not fetch while a page is already loading', () => {
    const fetchNextPage = vi.fn();
    renderWithQuery(
      <MediaList
        media={items}
        hasNextPage
        isFetchingNextPage
        fetchNextPage={fetchNextPage}
      />,
    );
    intersect();
    expect(fetchNextPage).not.toHaveBeenCalled();
  });
});
