// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { ratingFilterLabel } from '@/lib/constants';

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
