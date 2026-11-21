// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { EMAIL_RULES, passwordRules } from '@/lib/validation';

describe('EMAIL_RULES.pattern', () => {
  const pattern = EMAIL_RULES.pattern.value;

  it('accepts a@b.co', () => {
    expect(pattern.test('a@b.co')).toBe(true);
  });

  it.each(['a@b', 'ab.co', 'a b@c.co'])('rejects %s', (email) => {
    expect(pattern.test(email)).toBe(false);
  });
});

describe('passwordRules', () => {
  const rules = passwordRules('Enter a password');
  const pattern = rules.pattern.value;

  it('accepts a password with upper, lower, digit and special', () => {
    expect(pattern.test('Abcdef1!')).toBe(true);
  });

  it.each([
    ['an uppercase letter', 'abcdef1!'],
    ['a lowercase letter', 'ABCDEF1!'],
    ['a digit', 'Abcdefg!'],
    ['a special character', 'Abcdefg1'],
  ])('rejects a password without %s', (_, password) => {
    expect(pattern.test(password)).toBe(false);
  });

  it('sets the minimum length to 8', () => {
    expect(rules.minLength.value).toBe(8);
  });

  it("forwards the caller's required message unchanged", () => {
    expect(passwordRules('Custom message').required).toBe('Custom message');
  });
});
