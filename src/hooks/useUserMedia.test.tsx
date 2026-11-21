import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUserMedia } from '@/hooks/useUserMedia';
import { queryWrapper } from '@/test/render';
import { createSupabaseMock } from '@/test/supabaseMock';
import type { FilterMediaType, RatingFilter, UserMediaPage } from '@/types';

const supabase = createSupabaseMock();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => supabase.client,
}));

afterEach(() => {
  supabase.reset();
});

type Args = {
  initialData?: UserMediaPage;
  search?: string;
  mediaType?: FilterMediaType;
  rating?: RatingFilter;
};

function setup() {
  const { queryClient, wrapper } = queryWrapper();
  const renderFull = ({ initialData, search, mediaType, rating }: Args = {}) =>
    renderHook(
      () => useUserMedia('watched', initialData, search, mediaType, rating),
      { wrapper },
    );
  const render = (args: Args = {}) => renderFull(args).result;
  const queries = () =>
    queryClient
      .getQueryCache()
      .findAll({ queryKey: ['user-movies'] })
      .map((query) => query);
  return { queryClient, render, renderFull, queries };
}

const page = (nextPage: number | null): UserMediaPage => ({
  media: [],
  nextPage,
});

describe('useUserMedia', () => {
  it('shares one cache entry for the same ratings in any order', async () => {
    supabase.respond('user_media', { data: [] }, { data: [] });
    const { render, queries } = setup();
    const a = render({ rating: [8, 10] });
    const b = render({ rating: [10, 8] });

    await waitFor(() => expect(a.current.isSuccess).toBe(true));
    await waitFor(() => expect(b.current.isSuccess).toBe(true));
    expect(queries().map((q) => q.queryKey)).toEqual([
      ['user-movies', 'watched', undefined, undefined, '8,10'],
    ]);
  });

  it("keys mediaType 'all' the same as no media type", async () => {
    supabase.respond('user_media', { data: [] }, { data: [] });
    const { render, queries } = setup();
    const all = render({ mediaType: 'all' });
    const none = render();

    await waitFor(() => expect(all.current.isSuccess).toBe(true));
    await waitFor(() => expect(none.current.isSuccess).toBe(true));
    expect(queries().map((q) => q.queryKey)).toEqual([
      ['user-movies', 'watched', undefined, undefined, ''],
    ]);
  });

  it('seeds initialData with no search, media type or rating filter', () => {
    const initialData = page(null);
    const { render } = setup();
    const result = render({ initialData });

    expect(result.current.data?.pages).toEqual([initialData]);
    expect(supabase.chains('user_media')).toEqual([]);
  });

  it.each<[string, Args]>([
    ['a search', { search: 'fight' }],
    ['a media type', { mediaType: 'movie' }],
    ['a rating filter', { rating: [10] }],
  ])('does not seed initialData with %s', (_, args) => {
    supabase.respond('user_media', { data: [] });
    const { render } = setup();
    const result = render({ ...args, initialData: page(null) });

    expect(result.current.data).toBeUndefined();
  });

  it.each([
    [1, true],
    [null, false],
  ])(
    'reads the next page param from lastPage.nextPage (%j)',
    (nextPage, hasNextPage) => {
      const { render } = setup();
      const result = render({ initialData: page(nextPage) });
      expect(result.current.hasNextPage).toBe(hasNextPage);
    },
  );

  it.each([
    ['a search', { search: 'fight' }, 30_000],
    ['no search', {}, 120_000],
  ] as const)('uses the stale time for %s', async (_, args, staleTime) => {
    supabase.respond('user_media', { data: [] });
    const { renderFull, queries } = setup();
    const { result, rerender } = renderFull(args);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const fetchedAt = queries()[0].state.dataUpdatedAt;
    const now = vi.spyOn(Date, 'now');

    // isStale is recomputed against the clock on each render.
    now.mockReturnValue(fetchedAt + staleTime - 1_000);
    rerender();
    expect(result.current.isStale).toBe(false);

    now.mockReturnValue(fetchedAt + staleTime + 1_000);
    rerender();
    expect(result.current.isStale).toBe(true);
    now.mockRestore();
  });
});
