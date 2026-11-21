import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import StarRatingInput from '@/components/StarRatingInput';

function renderInput(initial = 0) {
  const onChange = vi.fn();
  function Harness() {
    const [value, setValue] = useState(initial);
    return (
      <StarRatingInput
        value={value}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
      />
    );
  }
  render(<Harness />);
  return { onChange, group: screen.getByRole('radiogroup') };
}

const checked = () =>
  screen
    .getAllByRole('radio')
    .filter((radio) => radio.getAttribute('aria-checked') === 'true');

describe('StarRatingInput', () => {
  it('stores the third full star as 6 out of 10', () => {
    const { onChange } = renderInput();
    fireEvent.click(screen.getByRole('radio', { name: '3 out of 5' }));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('stores a half star as an odd value', () => {
    const { onChange } = renderInput();
    fireEvent.click(screen.getByRole('radio', { name: '2.5 out of 5' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('moves by half a star with the arrow keys', () => {
    const { onChange, group } = renderInput(6);
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(7);
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(6);
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(5);
  });

  it('exposes an accessible name and the current value', () => {
    const { group } = renderInput(7);
    expect(group).toHaveAccessibleName('Rating out of 5 stars');
    expect(checked()).toHaveLength(1);
    expect(checked()[0]).toHaveAccessibleName('3.5 out of 5');
  });
});
