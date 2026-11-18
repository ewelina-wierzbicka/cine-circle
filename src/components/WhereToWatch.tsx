import Image from 'next/image';
import { tmdbImageUrl } from '@/lib/tmdbImage';
import { RegionWatchProviders, WatchProvider } from '@/types';

type Props = {
  providers: RegionWatchProviders;
  region: string;
  title: string;
  isAuthenticated: boolean;
};

const OFFER_GROUPS = [
  { key: 'flatrate', label: 'Stream' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
] as const;

function uniqueProviders(list: WatchProvider[] | undefined): WatchProvider[] {
  if (!list) return [];
  const seen = new Set<number>();
  return list.filter((provider) => {
    if (seen.has(provider.provider_id)) return false;
    seen.add(provider.provider_id);
    return true;
  });
}

export function WhereToWatch({
  providers,
  region,
  title,
  isAuthenticated,
}: Props) {
  const groups = OFFER_GROUPS.map(({ key, label }) => ({
    key,
    label,
    items: uniqueProviders(providers[key]),
  })).filter((group) => group.items.length > 0);

  if (groups.length === 0) return null;

  const body = (
    <>
      <h2 className="label-mono text-secondary mb-4">
        Where to watch · {region}
      </h2>
      <div className="flex flex-col gap-4">
        {groups.map(({ key, label, items }) => (
          <div key={key} className="flex flex-col gap-2">
            <p className="ui-mono text-secondary">{label}</p>
            <ul className="flex flex-wrap gap-2">
              {items.map((provider) => (
                <li key={provider.provider_id}>
                  {provider.logo_path ? (
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
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <section className="mt-8">
      {isAuthenticated ? (
        <a
          href={providers.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Where to watch ${title} in ${region} on TMDB`}
          className="block rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          {body}
        </a>
      ) : (
        <div>{body}</div>
      )}
      <p className="text-sm text-secondary mt-4">
        Streaming data provided by JustWatch
      </p>
    </section>
  );
}

export default WhereToWatch;
