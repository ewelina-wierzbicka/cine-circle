// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { describe, expect, it } from 'vitest';
import { toWatchRegion } from '@/lib/watchRegion';

describe('toWatchRegion', () => {
  it.each([
    ['us', 'US'],
    ['de', 'DE'],
  ])('uppercases %s to %s', (input, expected) => {
    expect(toWatchRegion(input)).toBe(expected);
  });

  it.each([null, '', 'USA', 'U1', '1', 'u'])('returns null for %j', (input) => {
    expect(toWatchRegion(input)).toBeNull();
  });
});
