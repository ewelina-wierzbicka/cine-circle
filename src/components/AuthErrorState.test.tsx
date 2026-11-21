import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthErrorState } from '@/components/AuthErrorState';

describe('AuthErrorState', () => {
  it('renders the copy and calls reset from the CTA', () => {
    const reset = vi.fn();
    render(
      <AuthErrorState
        eyebrow="Sign in failed"
        title="We could not sign you in"
        ctaLabel="Try signing in again"
        reset={reset}
      />,
    );

    expect(screen.getByText('Sign in failed')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'We could not sign you in',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Continue as guest' }),
    ).toHaveAttribute('href', '/');

    fireEvent.click(
      screen.getByRole('button', { name: 'Try signing in again' }),
    );
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
