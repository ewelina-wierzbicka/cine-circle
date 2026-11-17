import { RefObject, useEffect, useRef } from 'react';

/**
 * Calls `onOutside` on a `mousedown` outside `ref`. `mousedown` rather than
 * `click` so a dropdown closes before focus moves to what was clicked.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  onOutside: () => void,
) {
  const onOutsideRef = useRef(onOutside);

  useEffect(() => {
    onOutsideRef.current = onOutside;
  });

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const element = ref.current;
      if (element && !element.contains(event.target as Node)) {
        onOutsideRef.current();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [ref]);
}
