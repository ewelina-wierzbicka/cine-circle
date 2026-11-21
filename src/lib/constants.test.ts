// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { describe, expect, it } from 'vitest';
import { RATING_FILTER_OPTIONS, ratingFilterLabel } from '@/lib/constants';

describe('ratingFilterLabel', () => {
  it.each([
    [1, 'Half a star'],
    [2, '1 star'],
    [7, '3.5 stars'],
    [10, '5 stars'],
  ] as const)('labels %i as %s', (value, label) => {
    expect(ratingFilterLabel(value)).toBe(label);
  });
});

describe('RATING_FILTER_OPTIONS', () => {
  it('lists the ten ratings from 10 down to 1', () => {
    expect(RATING_FILTER_OPTIONS.map((o) => o.value)).toEqual([
      10, 9, 8, 7, 6, 5, 4, 3, 2, 1,
    ]);
  });
});
