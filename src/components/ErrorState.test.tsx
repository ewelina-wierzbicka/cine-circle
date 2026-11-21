import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ErrorState } from '@/components/ErrorState';
import { resetNavigation, router } from '@/test/navigation';

vi.mock('next/navigation', () => import('@/test/navigation'));

afterEach(() => {
  resetNavigation();
  vi.restoreAllMocks();
});

describe('ErrorState', () => {
  it('renders the message and calls reset on Try again', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.fn();
    render(<ErrorState error={new Error('boom')} reset={reset} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'We hit a glitch' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('sends Go home to /', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorState error={new Error('boom')} reset={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go home' }));
    expect(router.push).toHaveBeenCalledWith('/');
  });
});
