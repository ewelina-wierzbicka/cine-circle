import Image from 'next/image';
import { providerBrandKey, providerWatchUrl } from '@/lib/providerWatchUrl';
import { ProviderDeepLinks } from '@/lib/providerDeepLinks';
import { tmdbImageUrl } from '@/lib/tmdbImage';
import { RegionWatchProviders, WatchProvider } from '@/types';

type Props = {
  providers: RegionWatchProviders;
  region: string;
  title: string;
  isAuthenticated: boolean;
  deepLinks?: ProviderDeepLinks;
};

const OFFER_GROUPS = [
  { key: 'flatrate', label: 'Stream' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
  { key: 'ads', label: 'Free with ads' },
  { key: 'free', label: 'Free' },
] as const;

/** Shown when the request carries no country, rather than guessing one. */
export function WatchRegionUnknown() {
  return (
    <section className="mt-8">
      <h2 className="label-mono text-secondary mb-2">Where to watch</h2>
      <p className="text-sm text-secondary">
        We could not establish your region, so streaming options are hidden.
      </p>
    </section>
  );
}

function uniqueProviders(list: WatchProvider[] | undefined): WatchProvider[] {
  if (!list) return [];
  const seen = new Set<string>();
  return list.filter((provider) => {
    const brand = providerBrandKey(provider.provider_id);
    if (seen.has(brand)) return false;
    seen.add(brand);
    return true;
  });
}

export function WhereToWatch({
  providers,
  region,
  title,
  isAuthenticated,
  deepLinks,
}: Props) {
  const groups = OFFER_GROUPS.map(({ key, label }) => ({
    key,
    label,
    items: uniqueProviders(providers[key]),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="label-mono text-secondary mb-4">
        Where to watch · {region}
      </h2>
      <div className="flex flex-col gap-4">
        {groups.map(({ key, label, items }) => (
          <div key={key} className="flex flex-col gap-2">
            <p id={`watch-group-${key}`} className="ui-mono text-secondary">
              {label}
            </p>
            <ul
              aria-labelledby={`watch-group-${key}`}
              className="flex flex-wrap gap-1"
            >
              {items.map((provider) => {
                const logo = provider.logo_path ? (
                  <Image
                    src={tmdbImageUrl(provider.logo_path)}
                    alt={provider.provider_name}
                    title={provider.provider_name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-lg border border-white/[0.07]"
                  />
                ) : (
                  <span className="ui-mono text-primary">
                    {provider.provider_name}
                  </span>
                );

                const href = isAuthenticated
                  ? providerWatchUrl(
                      provider.provider_id,
                      title,
                      providers.link,
                      deepLinks,
                    )
                  : undefined;

                return (
                  <li key={provider.provider_id}>
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Watch ${title} on ${provider.provider_name}`}
                        className="block p-1 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        {logo}
                      </a>
                    ) : (
                      <div className="p-1">{logo}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-sm text-secondary mt-4">
        Streaming data provided by JustWatch
      </p>
    </section>
  );
}

export default WhereToWatch;
