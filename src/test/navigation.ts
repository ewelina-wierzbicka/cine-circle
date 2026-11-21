import { vi } from 'vitest';

/**
 * Shared `next/navigation` stand-in. Use it as
 * `vi.mock('next/navigation', () => import('@/test/navigation'))`, then
 * steer `navigation.pathname` / `navigation.searchParams` per test and assert
 * on `router`. Call `resetNavigation()` in `afterEach`.
 */
export const router = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

export const navigation = {
  pathname: '/',
  searchParams: new URLSearchParams(),
};

export function resetNavigation() {
  Object.values(router).forEach((fn) => fn.mockReset());
  navigation.pathname = '/';
  navigation.searchParams = new URLSearchParams();
}

export const useRouter = () => router;
export const usePathname = () => navigation.pathname;
export const useSearchParams = () => navigation.searchParams;
