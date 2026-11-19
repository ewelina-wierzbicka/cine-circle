import assert from 'node:assert/strict';
import { toWatchRegion } from '../src/lib/watchRegion.ts';

// A usable geo code wins, uppercased.
assert.equal(toWatchRegion('PL'), 'PL');
assert.equal(toWatchRegion('pl'), 'PL');
assert.equal(toWatchRegion(' gb '), 'GB');

// Anything else is null. No default country, so the caller can say it does
// not know instead of showing another country's providers.
assert.equal(toWatchRegion(null), null);
assert.equal(toWatchRegion(''), null);
assert.equal(toWatchRegion('XYZ'), null);
assert.equal(toWatchRegion('1'), null);
assert.equal(toWatchRegion('150'), null);
assert.equal(toWatchRegion('*'), null);

// accept-language is not a location source and is never read.
assert.equal(toWatchRegion('pl-PL,pl;q=0.9'), null);

console.log('toWatchRegion ok');
