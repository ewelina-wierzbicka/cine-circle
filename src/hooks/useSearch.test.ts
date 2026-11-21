import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearch } from '@/hooks/useSearch';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// Only the fields the hook reads; React's synthetic events carry far more.
const change = (value: string) =>
  ({ target: { value } }) as ChangeEvent<HTMLInputElement>;

const keyDown = (key: string) => {
  const preventDefault = vi.fn();
  return {
    event: {
      key,
      preventDefault,
    } as unknown as KeyboardEvent<HTMLInputElement>,
    preventDefault,
  };
};

describe('useSearch', () => {
  it('updates debouncedQuery only after the debounce window', () => {
    const { result } = renderHook(() =>
      useSearch({ onSearch: vi.fn(), debounceMs: 300 }),
    );
    act(() => result.current.handleChange(change('fight')));

    act(() => vi.advanceTimersByTime(299));
    expect(result.current.debouncedQuery).toBe('');

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.debouncedQuery).toBe('fight');
  });

  it('calls onSearch with the current value on Enter and prevents the default', () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() =>
      useSearch({ onSearch, debounceMs: 300 }),
    );
    act(() => result.current.handleChange(change('fight club')));

    const enter = keyDown('Enter');
    act(() => result.current.handleKeyDown(enter.event));

    expect(onSearch).toHaveBeenCalledWith('fight club');
    expect(enter.preventDefault).toHaveBeenCalled();
  });

  it('ignores other keys', () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() => useSearch({ onSearch }));
    const other = keyDown('a');
    act(() => result.current.handleKeyDown(other.event));

    expect(onSearch).not.toHaveBeenCalled();
    expect(other.preventDefault).not.toHaveBeenCalled();
  });

  it('seeds the state from initialQuery', () => {
    const onSearch = vi.fn();
    const { result } = renderHook(() =>
      useSearch({ onSearch, initialQuery: 'alien', debounceMs: 300 }),
    );
    expect(result.current.debouncedQuery).toBe('alien');

    act(() => result.current.handleSearch());
    expect(onSearch).toHaveBeenCalledWith('alien');
  });
});
