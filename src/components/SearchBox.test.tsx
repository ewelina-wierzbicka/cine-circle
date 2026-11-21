import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBox } from '@/components/SearchBox';
import { toHref } from '@/lib/mediaUtils';
import { resetNavigation, router } from '@/test/navigation';
import { renderWithQuery } from '@/test/render';

vi.mock('next/navigation', () => import('@/test/navigation'));

const fetchMock = vi.fn<typeof fetch>();

const RESULT = {
  id: 550,
  title: 'Fight Club',
  media_type: 'movie',
  release_date: '1999-10-15',
};

beforeEach(() => {
  fetchMock.mockImplementation(async (input) => {
    const url = String(input);
    if (url.startsWith('/api/search'))
      return Response.json({ results: [RESULT], hasMore: false });
    return Response.json({ director: 'David Fincher' });
  });
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  fetchMock.mockReset();
  resetNavigation();
  vi.unstubAllGlobals();
});

const searchCalls = () =>
  fetchMock.mock.calls
    .map(([input]) => String(input))
    .filter((url) => url.startsWith('/api/search'));

function renderSearch() {
  renderWithQuery(
    <>
      <SearchBox />
      <p>outside</p>
    </>,
  );
  return screen.getByPlaceholderText('Search movies & series…');
}

function type(input: HTMLElement, value: string) {
  fireEvent.change(input, { target: { value } });
}

const listbox = () => screen.queryByRole('listbox', { name: 'Search results' });

describe('SearchBox', () => {
  it('debounces typing before the query fires', async () => {
    const input = renderSearch();
    type(input, 'fight');
    expect(searchCalls()).toEqual([]);

    await waitFor(() =>
      expect(searchCalls()).toEqual([
        '/api/search?query=fight&page=1&type=all',
      ]),
    );
  });

  it('submits on Enter without waiting for the debounce', () => {
    const input = renderSearch();
    type(input, 'fight club');
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(router.push).toHaveBeenCalledWith(
      '/search?query=fight%20club&type=all',
    );
  });

  it('opens the dropdown with results', async () => {
    const input = renderSearch();
    type(input, 'fight');
    expect(
      await screen.findByRole('option', { name: /Fight Club/ }),
    ).toBeInTheDocument();
    expect(listbox()).toBeInTheDocument();
  });

  it('closes the dropdown on an outside click', async () => {
    const input = renderSearch();
    type(input, 'fight');
    await screen.findByRole('option', { name: /Fight Club/ });

    fireEvent.mouseDown(screen.getByText('outside'));
    expect(listbox()).not.toBeInTheDocument();
  });

  it('closes the dropdown on Escape', async () => {
    const input = renderSearch();
    type(input, 'fight');
    await screen.findByRole('option', { name: /Fight Club/ });

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(listbox()).not.toBeInTheDocument();
  });

  it('navigates to the result page on choosing a result', async () => {
    const input = renderSearch();
    type(input, 'fight');
    fireEvent.mouseDown(
      await screen.findByRole('option', { name: /Fight Club/ }),
    );

    expect(router.push).toHaveBeenCalledWith(
      `${toHref(550, 'Fight Club', 'movie')}?from=search`,
    );
  });
});

// Asserting an absence: fake timers run the debounce window out without
// spending it in wall clock.
describe('SearchBox with a blank query', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders no dropdown for an empty query', () => {
    const input = renderSearch();
    type(input, '   ');

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(listbox()).not.toBeInTheDocument();
    expect(searchCalls()).toEqual([]);
  });
});
