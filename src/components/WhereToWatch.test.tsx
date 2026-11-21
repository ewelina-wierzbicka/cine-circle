import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WatchRegionUnknown, WhereToWatch } from '@/components/WhereToWatch';
import { providerWatchUrl } from '@/lib/providerWatchUrl';
import type { RegionWatchProviders, WatchProvider } from '@/types';

const TITLE = 'Fight Club';
const netflix: WatchProvider = {
  provider_id: 8,
  provider_name: 'Netflix',
  logo_path: '/n.jpg',
};
const netflixAds: WatchProvider = {
  provider_id: 1796,
  provider_name: 'Netflix basic with Ads',
  logo_path: '/na.jpg',
};
const unknown: WatchProvider = { provider_id: 999999, provider_name: 'Indie' };
const apple: WatchProvider = {
  provider_id: 2,
  provider_name: 'Apple TV',
  logo_path: '/a.jpg',
};

function renderProviders(providers: RegionWatchProviders) {
  render(<WhereToWatch providers={providers} region="US" title={TITLE} />);
}

describe('WhereToWatch', () => {
  it('shows one logo per brand', () => {
    renderProviders({ flatrate: [netflix, netflixAds] });
    expect(
      within(screen.getByRole('list', { name: 'Stream' })).getAllByRole(
        'listitem',
      ),
    ).toHaveLength(1);
  });

  it('links every logo to providerWatchUrl', () => {
    const link = 'https://www.themoviedb.org/movie/550/watch';
    renderProviders({ link, flatrate: [netflix], rent: [apple] });

    for (const provider of [netflix, apple]) {
      expect(
        screen.getByRole('link', {
          name: `Watch ${TITLE} on ${provider.provider_name}`,
        }),
      ).toHaveAttribute(
        'href',
        providerWatchUrl(provider.provider_id, TITLE, link),
      );
    }
  });

  it('leaves a provider with no brand and no TMDB link unlinked', () => {
    renderProviders({ flatrate: [unknown] });
    expect(screen.getByText('Indie')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('groups each offer type separately', () => {
    renderProviders({
      flatrate: [netflix],
      rent: [apple],
      buy: [apple],
      ads: [unknown],
      free: [unknown],
    });
    for (const name of ['Stream', 'Rent', 'Buy', 'Free with ads', 'Free']) {
      expect(screen.getByRole('list', { name })).toBeInTheDocument();
    }
  });

  it('always credits JustWatch', () => {
    renderProviders({ flatrate: [unknown] });
    expect(
      screen.getByText('Streaming data provided by JustWatch'),
    ).toBeInTheDocument();
  });
});

describe('WatchRegionUnknown', () => {
  it('says the region is unknown', () => {
    render(<WatchRegionUnknown />);
    expect(
      screen.getByRole('heading', { name: 'Where to watch' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/could not establish your region/),
    ).toBeInTheDocument();
  });
});
