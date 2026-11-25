import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import MediaEntryForm from '@/components/MediaEntryForm';
import { addUserMedia, updateUserMedia } from '@/services/addUserMedia';
import { navigation, resetNavigation, router } from '@/test/navigation';
import { renderWithQuery } from '@/test/render';
import type { NormalizedMedia, SavedMedia } from '@/types';

vi.mock('next/navigation', () => import('@/test/navigation'));
vi.mock('@/services/addUserMedia', () => ({
  addUserMedia: vi.fn(async () => ({ status: 'inserted' })),
  updateUserMedia: vi.fn(async () => undefined),
}));

// next/dynamic loads these on first render. The cold transform (react-day-picker
// and its CSS) takes longer than a test timeout, so warm it once up front.
beforeAll(async () => {
  await import('@/components/UserEntryForm');
  await import('@/components/DatePicker');
}, 60_000);

// The form only renders on step 2.
beforeEach(() => {
  navigation.searchParams = new URLSearchParams('step=2');
});

afterEach(() => {
  resetNavigation();
  vi.clearAllMocks();
});

const media: NormalizedMedia = {
  id: 550,
  title: 'Fight Club',
  media_type: 'movie',
};

const savedWatched: SavedMedia = {
  ...media,
  id: 42,
  tmdb_id: 550,
  watchStatus: 'watched',
  rating: 6,
};

describe('MediaEntryForm', () => {
  it('renders nothing on step 1', () => {
    navigation.searchParams = new URLSearchParams();
    const { container } = renderWithQuery(<MediaEntryForm media={media} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('adds an unsaved title', async () => {
    renderWithQuery(<MediaEntryForm media={media} />);
    fireEvent.click(await screen.findByRole('button', { name: 'SAVE' }));

    await waitFor(() => expect(addUserMedia).toHaveBeenCalledTimes(1));
    expect(updateUserMedia).not.toHaveBeenCalled();
  });

  it('updates a saved title by its user_media id, then returns to the info step', async () => {
    renderWithQuery(<MediaEntryForm media={savedWatched} />);
    fireEvent.click(await screen.findByRole('button', { name: 'UPDATE' }));

    await waitFor(() => expect(router.refresh).toHaveBeenCalled());
    expect(updateUserMedia).toHaveBeenCalledWith(42, expect.any(Object));
    expect(addUserMedia).not.toHaveBeenCalled();
  });

  it('sends a moved to-watch title to the watched tab', async () => {
    renderWithQuery(
      <MediaEntryForm media={{ ...savedWatched, watchStatus: 'to_watch' }} />,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'UPDATE' }));

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith('/collection?tab=watched'),
    );
  });
});
