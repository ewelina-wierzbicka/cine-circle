import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { savedKey, useSavedMediaStatus } from '@/hooks/useSavedMediaStatus';
import { createSupabaseMock } from '@/test/supabaseMock';

const supabase = createSupabaseMock();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => supabase.client,
}));

afterEach(() => {
  supabase.reset();
});

function renderStatus(enabled = true) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const hook = renderHook(() => useSavedMediaStatus(enabled), { wrapper });
  return { queryClient, ...hook };
}

describe('savedKey', () => {
  it('keys by media type then TMDB id', () => {
    expect(savedKey('series', 1399)).toBe('series-1399');
  });
});

describe('useSavedMediaStatus', () => {
  it('maps each saved row by media type and TMDB id', async () => {
    supabase.respond('user_media', {
      data: [
        {
          id: 1,
          watchStatus: 'watched',
          media: { tmdb_id: 550, media_type: 'movie' },
        },
        {
          id: 2,
          watchStatus: 'to_watch',
          media: { tmdb_id: 550, media_type: 'series' },
        },
      ],
    });
    const { result } = renderStatus();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(Object.fromEntries(result.current.data ?? [])).toEqual({
      [savedKey('movie', 550)]: { userMediaId: 1, watchStatus: 'watched' },
      [savedKey('series', 550)]: { userMediaId: 2, watchStatus: 'to_watch' },
    });
  });

  it('skips rows whose media join is null', async () => {
    supabase.respond('user_media', {
      data: [
        { id: 1, watchStatus: 'watched', media: null },
        {
          id: 2,
          watchStatus: 'to_watch',
          media: { tmdb_id: 13, media_type: 'movie' },
        },
      ],
    });
    const { result } = renderStatus();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect([...(result.current.data?.keys() ?? [])]).toEqual(['movie-13']);
  });

  it('returns an empty map on a query error', async () => {
    supabase.respond('user_media', { error: { message: 'boom' } });
    const { result } = renderStatus();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isError).toBe(false);
    expect(result.current.data?.size).toBe(0);
  });

  it('fires no query when disabled', async () => {
    const { result } = renderStatus(false);
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(result.current.fetchStatus).toBe('idle');
    expect(supabase.chains('user_media')).toEqual([]);
  });

  it("caches under ['user-movies', 'saved-status']", async () => {
    supabase.respond('user_media', { data: [] });
    const { result, queryClient } = renderStatus();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(['user-movies', 'saved-status'])).toBe(
      result.current.data,
    );
  });
});
