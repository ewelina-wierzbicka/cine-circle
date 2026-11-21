import { fireEvent, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useClickOutside } from '@/hooks/useClickOutside';

afterEach(() => {
  document.body.innerHTML = '';
});

function setup() {
  const inside = document.createElement('div');
  const child = document.createElement('button');
  const outside = document.createElement('p');
  inside.append(child);
  document.body.append(inside, outside);

  const onOutside = vi.fn();
  const hook = renderHook(() =>
    useClickOutside({ current: inside }, onOutside),
  );
  return { child, inside, outside, onOutside, ...hook };
}

describe('useClickOutside', () => {
  it('fires for a mousedown outside the ref', () => {
    const { outside, onOutside } = setup();
    fireEvent.mouseDown(outside);
    expect(onOutside).toHaveBeenCalledTimes(1);
  });

  it('does not fire for a mousedown inside the ref', () => {
    const { inside, child, onOutside } = setup();
    fireEvent.mouseDown(inside);
    fireEvent.mouseDown(child);
    expect(onOutside).not.toHaveBeenCalled();
  });

  it('stops listening after unmount', () => {
    const { outside, onOutside, unmount } = setup();
    unmount();
    fireEvent.mouseDown(outside);
    expect(onOutside).not.toHaveBeenCalled();
  });
});
