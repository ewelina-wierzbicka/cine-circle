import { useEffect, useLayoutEffect, useState } from "react";

function getMediaQuery(breakpoint: number) {
  return window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
}

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useIsTablet(breakpoint = 1024) {
  const [isTablet, setIsTablet] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const mql = getMediaQuery(breakpoint);
    setIsTablet(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsTablet(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);

  return isTablet;
}
