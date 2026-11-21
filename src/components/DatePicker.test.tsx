import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DatePicker from '@/components/DatePicker';
import { FieldLabel } from '@/components/FieldLabel';

function renderPicker() {
  const handleChange = vi.fn();
  render(
    <>
      <FieldLabel htmlFor="watched_date">When did you watch it?</FieldLabel>
      <DatePicker id="watched_date" handleChange={handleChange} />
    </>,
  );
  return {
    handleChange,
    trigger: screen.getByLabelText('When did you watch it?'),
  };
}

// Day 1 of the current month is always in the past or today, so never disabled.
function firstOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

describe('DatePicker', () => {
  it('opens the calendar and calls back with the picked day', () => {
    const { handleChange, trigger } = renderPicker();
    fireEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: 'Choose date' })).toBeVisible();

    const day = firstOfMonth();
    const month = day.toLocaleString('en-US', { month: 'long' });
    fireEvent.click(
      screen.getByRole('button', {
        name: new RegExp(`${month} 1st, ${day.getFullYear()}`),
      }),
    );

    expect(handleChange).toHaveBeenCalledTimes(1);
    const picked: Date = handleChange.mock.calls[0][0];
    expect(picked.toDateString()).toBe(day.toDateString());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const { trigger } = renderPicker();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    const dialog = screen.getByRole('dialog', { name: 'Choose date' });
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement),
    );

    fireEvent.keyDown(document.activeElement ?? dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});
