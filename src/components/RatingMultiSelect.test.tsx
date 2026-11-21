import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { RatingMultiSelect } from '@/components/RatingMultiSelect';
import type { RatingFilter } from '@/types';

// jsdom does not implement scrollIntoView; the open list scrolls the
// highlighted option into view.
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

function renderMultiSelect(initial: RatingFilter = []) {
  const onChange = vi.fn();
  function Harness() {
    const [value, setValue] = useState<RatingFilter>(initial);
    return (
      <RatingMultiSelect
        value={value}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
      />
    );
  }
  render(<Harness />);
  const trigger = () => screen.getByRole('combobox');
  fireEvent.click(trigger());
  return { onChange, trigger };
}

describe('RatingMultiSelect', () => {
  it('lists 5 stars down to half a star', () => {
    renderMultiSelect();
    expect(
      screen.getAllByRole('option').map((o) => o.getAttribute('aria-label')),
    ).toEqual([
      '5 stars',
      '4.5 stars',
      '4 stars',
      '3.5 stars',
      '3 stars',
      '2.5 stars',
      '2 stars',
      '1.5 stars',
      '1 star',
      'Half a star',
    ]);
  });

  it('toggles a rating on, then off', () => {
    const { onChange } = renderMultiSelect();
    const option = screen.getByRole('option', { name: '4 stars' });

    fireEvent.click(option);
    expect(onChange).toHaveBeenLastCalledWith([8]);
    expect(option).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(option);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(option).toHaveAttribute('aria-selected', 'false');
  });

  it('sends both selections in one payload', () => {
    const { onChange } = renderMultiSelect();
    fireEvent.click(screen.getByRole('option', { name: '5 stars' }));
    fireEvent.click(screen.getByRole('option', { name: '4 stars' }));
    expect(onChange).toHaveBeenLastCalledWith([10, 8]);
  });

  it('labels the trigger with the selection', () => {
    const { trigger } = renderMultiSelect();
    expect(trigger()).toHaveAccessibleName('Filter by rating: any rating');

    fireEvent.click(screen.getByRole('option', { name: '5 stars' }));
    expect(trigger()).toHaveAccessibleName('Filter by rating: 5 stars');

    fireEvent.click(screen.getByRole('option', { name: 'Half a star' }));
    expect(trigger()).toHaveAccessibleName(
      'Filter by rating: 2 ratings selected',
    );
  });

  it('clears to an empty selection', () => {
    const { onChange, trigger } = renderMultiSelect([10, 8]);
    fireEvent.click(screen.getByRole('button', { name: 'Clear ratings' }));

    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(trigger()).toHaveAccessibleName('Filter by rating: any rating');
  });
});
