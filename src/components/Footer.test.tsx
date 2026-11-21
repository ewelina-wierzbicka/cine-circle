import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from '@/components/Footer';

describe('Footer', () => {
  it('shows only the attribution when attributionOnly', () => {
    render(<Footer attributionOnly />);
    expect(
      screen.queryByRole('navigation', { name: 'Footer' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/© \d{4} MidnightFrame/)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^TMDB/ })).toBeInTheDocument();
  });

  it('links /about, /terms and /privacy in the full variant', () => {
    render(<Footer />);
    const nav = screen.getByRole('navigation', { name: 'Footer' });
    const hrefs = [...nav.querySelectorAll('a')].map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(
      expect.arrayContaining(['/about', '/terms', '/privacy']),
    );
    expect(screen.getByText(/© \d{4} MidnightFrame/)).toBeInTheDocument();
  });
});
