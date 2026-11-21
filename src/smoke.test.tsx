import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { twMerge } from '@/lib/cn';

// Smoke test for the runner itself: the `@/` alias, JSX, jsdom rendering and
// the jest-dom matchers registered in vitest.setup.ts.
describe('unit test runner', () => {
  it('resolves the @/ alias', () => {
    expect(twMerge('p-2', 'p-4')).toBe('p-4');
  });

  it('renders a component into jsdom', () => {
    render(<p className={twMerge('text-sm')}>runner works</p>);

    expect(screen.getByText('runner works')).toBeVisible();
  });
});
