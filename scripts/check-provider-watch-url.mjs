import assert from 'node:assert/strict';
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

console.log('providerWatchUrl ok');
