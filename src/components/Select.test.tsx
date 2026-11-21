import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import Select from '@/components/Select';

const OPTIONS = [
  { value: 'movie', label: 'Movies' },
  { value: 'series', label: 'Series' },
  { value: 'all', label: 'Movies & Series' },
];

function renderSelect(onChange = vi.fn(), initial = 'series') {
  function Harness() {
    const [value, setValue] = useState(initial);
    return (
      <Select
        value={value}
        options={OPTIONS}
        onChange={(next) => {
          onChange(next);
          setValue(next);
        }}
      />
    );
  }
  render(
    <>
      <Harness />
      <p>outside</p>
    </>,
  );
  return { onChange, trigger: screen.getByRole('button', { name: /Series/ }) };
}

describe('Select', () => {
  it('opens on click and reflects it in aria-expanded', () => {
    const { trigger } = renderSelect();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('marks the current option aria-selected', () => {
    const { trigger } = renderSelect();
    fireEvent.click(trigger);
    expect(screen.getByRole('option', { name: 'Series' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('option', { name: 'Movies' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('closes on an outside click', () => {
    const { trigger } = renderSelect();
    fireEvent.click(trigger);
    fireEvent.mouseDown(screen.getByText('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const { trigger } = renderSelect();
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('calls onChange with the chosen value and closes', () => {
    const { trigger, onChange } = renderSelect();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'Movies' }));

    expect(onChange).toHaveBeenCalledWith('movie');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  // Arrow keys change the value directly; there is no separate active option.
  it('moves the value with the arrow keys', () => {
    const { trigger, onChange } = renderSelect();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith('all');
    fireEvent.keyDown(trigger, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenLastCalledWith('series');
  });

  it('toggles the list with Enter', () => {
    const { trigger } = renderSelect();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
