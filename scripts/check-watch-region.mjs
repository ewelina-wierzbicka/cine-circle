import assert from 'node:assert/strict';
import { DEFAULT_WATCH_REGION, toWatchRegion } from '../src/lib/watchRegion.ts';

// The geo header wins over accept-language.
assert.equal(toWatchRegion('PL', 'en-US,en;q=0.9'), 'PL');
assert.equal(toWatchRegion('pl', 'en-US'), 'PL');

// A region subtag is used when there is no geo header.
assert.equal(toWatchRegion(null, 'pl-PL,pl;q=0.9,en-US;q=0.8'), 'PL');
assert.equal(toWatchRegion(null, 'en-GB'), 'GB');
assert.equal(toWatchRegion(null, 'zh-Hant-TW'), 'TW');

// A bare language carries no country, so it falls through.
assert.equal(toWatchRegion(null, 'pl'), DEFAULT_WATCH_REGION);
assert.equal(toWatchRegion(null, 'en,pl'), DEFAULT_WATCH_REGION);

// No usable headers at all.
assert.equal(toWatchRegion(null, null), DEFAULT_WATCH_REGION);
assert.equal(toWatchRegion(null), DEFAULT_WATCH_REGION);
assert.equal(toWatchRegion('', ''), DEFAULT_WATCH_REGION);
assert.equal(toWatchRegion('XYZ', '*'), DEFAULT_WATCH_REGION);

// q= weights decide which entry is read first.
assert.equal(toWatchRegion(null, 'en-US;q=0.5,pl-PL;q=0.9'), 'PL');
assert.equal(toWatchRegion(null, 'pl-PL;q=0.4,en-US;q=0.8'), 'US');
assert.equal(toWatchRegion(null, 'de-DE;q=0,pl-PL;q=0.1'), 'PL');
// Equal weights keep header order.
assert.equal(toWatchRegion(null, 'fr-FR;q=0.8,pl-PL;q=0.8'), 'FR');
// A malformed q is treated as the default weight of 1.
assert.equal(toWatchRegion(null, 'en-US;q=nope,pl-PL;q=0.9'), 'US');

console.log('toWatchRegion ok');
