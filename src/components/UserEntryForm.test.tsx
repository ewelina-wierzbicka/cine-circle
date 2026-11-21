import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import UserEntryForm from '@/components/UserEntryForm';
import { addUserMedia, updateUserMedia } from '@/services/addUserMedia';
import { resetNavigation } from '@/test/navigation';
import { renderWithQuery } from '@/test/render';
import type { NormalizedMedia } from '@/types';

vi.mock('next/navigation', () => import('@/test/navigation'));
vi.mock('@/services/addUserMedia', () => ({
  addUserMedia: vi.fn(async () => ({ status: 'inserted' })),
  updateUserMedia: vi.fn(async () => undefined),
}));

// next/dynamic loads these on first render. The cold transform (react-day-picker
// and its CSS) takes longer than a test timeout, so warm it once up front.
beforeAll(async () => {
  await import('@/components/DatePicker');
}, 60_000);

afterEach(() => {
  resetNavigation();
  vi.clearAllMocks();
});

const media: NormalizedMedia = {
  id: 550,
  title: 'Fight Club',
  media_type: 'movie',
  release_date: '1999-10-15',
  poster_path: '/p.jpg',
};

function renderForm(props: Partial<Parameters<typeof UserEntryForm>[0]> = {}) {
  const view = renderWithQuery(<UserEntryForm media={media} {...props} />);
  const invalidate = vi.spyOn(view.queryClient, 'invalidateQueries');
  return { ...view, invalidate };
}

const submit = (name: 'SAVE' | 'UPDATE') =>
  fireEvent.click(screen.getByRole('button', { name }));

describe('UserEntryForm', () => {
  it('submits a cleared rating as null, not 0', async () => {
    renderForm();
    const third = screen.getByRole('radio', { name: '3 out of 5' });
    fireEvent.click(third);
    fireEvent.click(third); // clicking the checked star clears it to 0
    submit('SAVE');

    await waitFor(() => expect(addUserMedia).toHaveBeenCalled());
    expect(vi.mocked(addUserMedia).mock.calls[0][1].rating).toBeNull();
  });

  it('adds in add mode', async () => {
    const { invalidate } = renderForm();
    fireEvent.click(screen.getByRole('radio', { name: '4 out of 5' }));
    submit('SAVE');

    await waitFor(() => expect(addUserMedia).toHaveBeenCalledTimes(1));
    expect(addUserMedia).toHaveBeenCalledWith(
      expect.objectContaining({ id: 550, title: 'Fight Club' }),
      expect.objectContaining({ watchStatus: 'watched', rating: 8 }),
    );
    expect(updateUserMedia).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ['user-movies'] }),
    );
  });

  it('updates the given row in update mode and invalidates user-movies', async () => {
    const onUpdateSuccess = vi.fn();
    const { invalidate } = renderForm({
      userMediaId: 42,
      initialData: { watchStatus: 'watched', rating: 6, review: 'Good' },
      onUpdateSuccess,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Clear rating' }));
    submit('UPDATE');

    await waitFor(() => expect(onUpdateSuccess).toHaveBeenCalledTimes(1));
    expect(updateUserMedia).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        watchStatus: 'watched',
        rating: null,
        review: 'Good',
      }),
    );
    expect(addUserMedia).not.toHaveBeenCalled();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['user-movies'] });
  });

  it('never calls onUpdateSuccess in add mode', async () => {
    const onUpdateSuccess = vi.fn();
    renderForm({ onUpdateSuccess });
    submit('SAVE');

    await waitFor(() => expect(addUserMedia).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'SAVE' })).toBeEnabled(),
    );
    expect(onUpdateSuccess).not.toHaveBeenCalled();
  });

  it('disables submit while saving', async () => {
    let finish: () => void = () => {};
    vi.mocked(updateUserMedia).mockImplementationOnce(
      () => new Promise<void>((resolve) => (finish = resolve)),
    );
    renderForm({ userMediaId: 42 });
    submit('UPDATE');

    const saving = await screen.findByRole('button', { name: 'SAVING…' });
    expect(saving).toBeDisabled();

    finish();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'UPDATE' })).toBeEnabled(),
    );
  });
});
