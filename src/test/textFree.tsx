import { render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { expect } from 'vitest';

/**
 * Duplicate-h1 regression guard: a media page once used the real header as
 * its Suspense fallback, so crawlers saw every TMDB string twice. A skeleton
 * must carry no copy at all.
 */
export function expectTextFree(Component: ComponentType) {
  const { container } = render(<Component />);
  expect(screen.queryAllByRole('heading')).toEqual([]);
  expect(container.querySelectorAll('h1, h2, h3, h4, h5, h6, p')).toHaveLength(
    0,
  );
  expect(container.textContent?.trim()).toBe('');
}
