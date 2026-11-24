import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDetailStep } from '@/hooks/useDetailStep';
import { navigation, resetNavigation, router } from '@/test/navigation';

vi.mock('next/navigation', () => import('@/test/navigation'));

afterEach(resetNavigation);

function at(pathname: string, query = '') {
  navigation.pathname = pathname;
  navigation.searchParams = new URLSearchParams(query);
  return renderHook(() => useDetailStep()).result;
}

describe('useDetailStep', () => {
  it('is step 2 only for ?step=2', () => {
    expect(at('/movie/550', 'step=2').current.step).toBe(2);
    expect(at('/movie/550', 'step=3').current.step).toBe(1);
    expect(at('/movie/550').current.step).toBe(1);
  });

  it('goToForm adds step=2 and keeps every other param', () => {
    const result = at('/movie/550', 'tab=watched&from=search');
    act(() => result.current.goToForm());

    const pushed = new URL(router.push.mock.calls[0][0], 'http://x');
    expect(pushed.pathname).toBe('/movie/550');
    expect(Object.fromEntries(pushed.searchParams)).toEqual({
      tab: 'watched',
      from: 'search',
      step: '2',
    });
  });

  it('goToInfo removes step and keeps the rest', () => {
    const result = at('/movie/550', 'tab=watched&step=2&from=search');
    act(() => result.current.goToInfo());
    expect(router.push).toHaveBeenCalledWith(
      '/movie/550?tab=watched&from=search',
    );
  });

  it('pushes the bare pathname when no params remain', () => {
    const result = at('/movie/550', 'step=2');
    act(() => result.current.goToInfo());
    expect(router.push).toHaveBeenCalledWith('/movie/550');
  });
});
