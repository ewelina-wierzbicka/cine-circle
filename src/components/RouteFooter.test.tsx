import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RouteFooter } from '@/components/RouteFooter';
import { navigation, resetNavigation } from '@/test/navigation';

vi.mock('next/navigation', () => import('@/test/navigation'));

afterEach(resetNavigation);

// The layout renders both placements on every route; only one may show.
function renderBoth(pathname: string) {
  navigation.pathname = pathname;
  render(
    <>
      <div data-testid="in-flow">
        <RouteFooter placement="in-flow" />
      </div>
      <div data-testid="pinned">
        <RouteFooter placement="pinned" />
      </div>
    </>,
  );
}

const attribution = () => screen.getAllByRole('link', { name: /^TMDB/ });

describe('RouteFooter', () => {
  it('renders only the pinned footer on /search', () => {
    renderBoth('/search');
    expect(screen.getByTestId('in-flow')).toBeEmptyDOMElement();
    expect(screen.getByTestId('pinned')).not.toBeEmptyDOMElement();
    expect(attribution()).toHaveLength(1);
  });

  it('renders only the in-flow footer on /', () => {
    renderBoth('/');
    expect(screen.getByTestId('pinned')).toBeEmptyDOMElement();
    expect(screen.getByTestId('in-flow')).not.toBeEmptyDOMElement();
    expect(attribution()).toHaveLength(1);
  });
});
