import { describe, expect, it } from 'vitest';
import { disallowRules, isDisallowed } from '@/test/robotsRules';

describe('robots', () => {
  it.each(['/collection', '/profile'])('disallows %s', (path) => {
    expect(disallowRules()).toContain(path);
    expect(isDisallowed(`${path}`)).toBe(true);
  });
});
