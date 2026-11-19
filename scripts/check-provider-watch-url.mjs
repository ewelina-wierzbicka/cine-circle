import assert from 'node:assert/strict';
import { buildProviderDeepLinks } from '../src/lib/providerDeepLinks.ts';
import {
  MAPPED_PROVIDER_IDS,
  providerBrandKey,
  providerWatchUrl,
} from '../src/lib/providerWatchUrl.ts';

const fallback = 'https://www.themoviedb.org/movie/550/watch?locale=US';

assert.ok(
  providerWatchUrl(8, 'Fight Club', fallback).startsWith(
    'https://www.netflix.com/',
  ),
);
assert.equal(providerWatchUrl(999999, 'Fight Club', fallback), fallback);
assert.equal(
  providerWatchUrl(8, 'Tom & Jerry', fallback),
  'https://www.netflix.com/search?q=Tom%20%26%20Jerry',
);

// TMDB may omit the aggregate link, so an unmapped id has no URL at all.
assert.equal(providerWatchUrl(999999, 'Fight Club', undefined), undefined);
assert.ok(providerWatchUrl(8, 'Fight Club', undefined));

assert.equal(providerBrandKey(8), providerBrandKey(1796));
const amazon = new Set([9, 10, 613, 2100].map(providerBrandKey));
assert.equal(amazon.size, 1);
assert.notEqual(providerBrandKey(8), providerBrandKey(9));
assert.notEqual(providerBrandKey(999998), providerBrandKey(999999));

assert.ok(MAPPED_PROVIDER_IDS.length > 0);
for (const id of MAPPED_PROVIDER_IDS) {
  const url = providerWatchUrl(id, 'x', fallback);
  assert.notEqual(url, fallback, `provider ${id} has no URL builder`);
}

// A deep link wins over the brand search URL, for every tier of the brand.
const netflixDeepLink = { netflix: 'https://www.netflix.com/title/70155590' };
assert.equal(
  providerWatchUrl(8, 'Fight Club', fallback, netflixDeepLink),
  netflixDeepLink.netflix,
);
assert.equal(
  providerWatchUrl(1796, 'Fight Club', fallback, netflixDeepLink),
  netflixDeepLink.netflix,
);
// A brand with no deep link keeps its search URL, an unmapped id the fallback.
assert.ok(
  providerWatchUrl(9, 'Fight Club', fallback, netflixDeepLink).includes(
    '/search',
  ),
);
assert.equal(
  providerWatchUrl(999999, 'Fight Club', fallback, netflixDeepLink),
  fallback,
);
// An empty deep-link map changes nothing.
assert.equal(
  providerWatchUrl(8, 'Fight Club', fallback, {}),
  providerWatchUrl(8, 'Fight Club', fallback),
);

console.log('providerWatchUrl ok');

// Every row was checked against Wikidata and the live provider. A dropped
// property or a changed formatter must fail here.
const DEEP_LINK_SAMPLES = [
  {
    brand: 'netflix',
    mediaType: 'movie',
    property: 'P1874',
    value: '70155590',
    url: 'https://www.netflix.com/title/70155590',
  },
  {
    brand: 'netflix',
    mediaType: 'series',
    property: 'P1874',
    value: '81653386',
    url: 'https://www.netflix.com/title/81653386',
  },
  {
    brand: 'max',
    mediaType: 'series',
    property: 'P8298',
    value: 'series/urn:hbo:series:GVU2cggagzYNJjhsJATwo',
    url: 'https://www.hbomax.com/series/urn:hbo:series:GVU2cggagzYNJjhsJATwo',
  },
  {
    brand: 'apple',
    mediaType: 'movie',
    property: 'P9586',
    value: 'umc.cmc.6loas01ow0w4lkatxxloz7a6e',
    url: 'https://tv.apple.com/movie/umc.cmc.6loas01ow0w4lkatxxloz7a6e',
  },
  {
    brand: 'apple',
    mediaType: 'series',
    property: 'P9751',
    value: 'umc.cmc.3trf3c8kzd8m4w72c9q8dwjqe',
    url: 'https://tv.apple.com/show/umc.cmc.3trf3c8kzd8m4w72c9q8dwjqe',
  },
  {
    brand: 'amazon',
    mediaType: 'series',
    property: 'P14440',
    value: '0P00G8BER6XI9SD3US74O0HTZV',
    url: 'https://www.primevideo.com/detail/0P00G8BER6XI9SD3US74O0HTZV',
  },
  {
    brand: 'amazon',
    mediaType: 'movie',
    property: 'P8055',
    value: 'B00BUUMWUK',
    url: 'https://www.amazon.com/gp/video/detail/B00BUUMWUK',
  },
  {
    brand: 'disney',
    mediaType: 'movie',
    property: 'P7595',
    value: '1HqwiEcje6Nj',
    url: 'https://www.disneyplus.com/movies/wd/1HqwiEcje6Nj',
  },
  {
    brand: 'disney',
    mediaType: 'series',
    property: 'P7596',
    value: '3ZoBZ52QHb4x',
    url: 'https://www.disneyplus.com/series/wp/3ZoBZ52QHb4x',
  },
  {
    brand: 'hulu',
    mediaType: 'movie',
    property: 'P6466',
    value: '99647742-42aa-4911-a91a-03a1d40dfe72',
    url: 'https://www.hulu.com/movie/99647742-42aa-4911-a91a-03a1d40dfe72',
  },
  {
    brand: 'hulu',
    mediaType: 'series',
    property: 'P6467',
    value: '92c225ee-2d39-4cb3-a43b-fbcffbefeeb4',
    url: 'https://www.hulu.com/series/92c225ee-2d39-4cb3-a43b-fbcffbefeeb4',
  },
];

/** One Wikidata statement, shaped like `Special:EntityData` returns it. */
const claimsFor = (property, value, rank = 'normal') => ({
  [property]: [
    { rank, mainsnak: { snaktype: 'value', datavalue: { value } } },
  ],
});

for (const { brand, mediaType, property, value, url } of DEEP_LINK_SAMPLES) {
  const links = buildProviderDeepLinks(claimsFor(property, value), mediaType);
  assert.equal(
    links[brand],
    url,
    `${property} no longer builds the ${brand} ${mediaType} URL`,
  );
}

// A property only applies to its own media type.
assert.deepEqual(buildProviderDeepLinks(claimsFor('P9751', 'x'), 'movie'), {});
assert.deepEqual(buildProviderDeepLinks(claimsFor('P9586', 'x'), 'series'), {});

// Nothing usable means no link at all, never a half-built URL.
assert.deepEqual(buildProviderDeepLinks({}, 'movie'), {});
assert.deepEqual(buildProviderDeepLinks({ P1874: [] }, 'movie'), {});
assert.deepEqual(
  buildProviderDeepLinks(claimsFor('P1874', 'x', 'deprecated'), 'movie'),
  {},
);
assert.deepEqual(
  buildProviderDeepLinks({ P1874: [{ mainsnak: { snaktype: 'novalue' } }] }, 'movie'),
  {},
);
assert.deepEqual(buildProviderDeepLinks(claimsFor('P1874', 12345), 'movie'), {});

// Wikidata is openly editable, so unsafe values must be dropped.
for (const unsafe of ['../evil', '//evil.com', 'a?b', 'a b', '/leading', 'a#b']) {
  assert.deepEqual(
    buildProviderDeepLinks(claimsFor('P1874', unsafe), 'movie'),
    {},
    `unsafe id accepted: ${unsafe}`,
  );
}

// A preferred rank wins, and Amazon prefers the Prime Video id over the ASIN.
assert.equal(
  buildProviderDeepLinks(
    {
      P1874: [
        { rank: 'normal', mainsnak: { snaktype: 'value', datavalue: { value: 'old' } } },
        { rank: 'preferred', mainsnak: { snaktype: 'value', datavalue: { value: 'new' } } },
      ],
    },
    'movie',
  ).netflix,
  'https://www.netflix.com/title/new',
);
assert.equal(
  buildProviderDeepLinks(
    {
      ...claimsFor('P14440', 'preferred-id'),
      ...claimsFor('P8055', 'B000000000'),
    },
    'movie',
  ).amazon,
  'https://www.primevideo.com/detail/preferred-id',
);

console.log('providerDeepLinks ok');

if (process.env.SKIP_PROVIDER_LINK_LIVE_CHECK === '1') {
  console.log('live deep-link check skipped');
  process.exit(0);
}

// Providers 403 a default fetch agent, so send a browser one.
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36';

/**
 * A sample must still resolve: 200, or a redirect that stays on the host.
 * A 404 or 410 means the formatter is dead and fails the script. Anything
 * else (bot wall, geo bounce, outage) is reported and tolerated.
 */
async function checkLive(url) {
  let res;
  try {
    res = await fetch(url, {
      redirect: 'manual',
      headers: { 'User-Agent': BROWSER_UA, Accept: 'text/html' },
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    return { ok: true, note: `unreachable (${error.name})` };
  }

  if (res.status === 404 || res.status === 410) {
    return { ok: false, note: `HTTP ${res.status}` };
  }
  if (res.status < 300 || res.status >= 400) {
    return { ok: true, note: `HTTP ${res.status}` };
  }

  const location = res.headers.get('location');
  if (!location) return { ok: true, note: `HTTP ${res.status}, no location` };

  const target = new URL(location, url);
  const sameHost = target.host === new URL(url).host;
  return {
    ok: true,
    note: `HTTP ${res.status} -> ${sameHost ? 'same host' : target.host}`,
  };
}

const failures = [];
for (const { brand, mediaType, property, url } of DEEP_LINK_SAMPLES) {
  const { ok, note } = await checkLive(url);
  const label = `${brand} ${mediaType} ${property}: ${note}`;
  if (ok) console.log(`  ${label}`);
  else failures.push(`${label} — ${url}`);
}

if (failures.length > 0) {
  console.error('dead provider deep links:');
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log('live deep-link check ok');
