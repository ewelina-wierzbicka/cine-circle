import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NotFoundState } from '@/components/NotFoundState';
import { resetNavigation, router } from '@/test/navigation';

vi.mock('next/navigation', () => import('@/test/navigation'));

afterEach(() => {
  resetNavigation();
  vi.restoreAllMocks();
});

describe('NotFoundState', () => {
  it('renders the message and sends Back to home to /', () => {
    render(<NotFoundState />);
    expect(
      screen.getByRole('heading', { level: 1, name: /scene.*exist/ }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back to home' }));
    expect(router.push).toHaveBeenCalledWith('/');
  });
});
