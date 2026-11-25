// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clientKey,
  FAILURE_THRESHOLD,
  isRateLimited,
  MAX_TRACKED_KEYS,
  recordFailure,
  reportAuthFailure,
  WINDOW_MS,
  type FailureWindow,
} from '@/lib/authFailureAlert';

const { captureSecurityEvent, headerValue } = vi.hoisted(() => ({
  captureSecurityEvent: vi.fn(),
  headerValue: { current: null as string | null },
}));

vi.mock('@/lib/captureSecurityEvent', () => ({ captureSecurityEvent }));

vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: (name: string) =>
        name === 'x-forwarded-for' ? headerValue.current : null,
    }),
}));

let state: Map<string, FailureWindow>;

function fail(key: string, times = 1): boolean[] {
  return Array.from({ length: times }, () =>
    recordFailure(state, key, Date.now()),
  );
}

beforeEach(() => {
  state = new Map();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-23T12:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  captureSecurityEvent.mockClear();
  headerValue.current = null;
});

describe('recordFailure', () => {
  it('stays quiet under the threshold', () => {
    expect(fail('1.1.1.1', FAILURE_THRESHOLD - 1)).not.toContain(true);
  });

  it('trips exactly once at the threshold', () => {
    const fired = fail('1.1.1.1', FAILURE_THRESHOLD);

    expect(fired.filter(Boolean)).toHaveLength(1);
    expect(fired[FAILURE_THRESHOLD - 1]).toBe(true);
  });

  it('does not trip again later in the same window', () => {
    fail('1.1.1.1', FAILURE_THRESHOLD);
    vi.advanceTimersByTime(WINDOW_MS / 2);

    expect(fail('1.1.1.1', FAILURE_THRESHOLD * 2)).not.toContain(true);
  });

  it('re-arms once the window expires', () => {
    fail('1.1.1.1', FAILURE_THRESHOLD);
    vi.advanceTimersByTime(WINDOW_MS);

    expect(fail('1.1.1.1', FAILURE_THRESHOLD).filter(Boolean)).toHaveLength(1);
  });

  it('counts each key independently', () => {
    fail('1.1.1.1', FAILURE_THRESHOLD - 1);

    expect(fail('2.2.2.2')).toEqual([false]);
    expect(fail('1.1.1.1')).toEqual([true]);
  });

  it('drops keys whose window has expired', () => {
    fail('1.1.1.1');
    vi.advanceTimersByTime(WINDOW_MS);
    fail('2.2.2.2');

    expect([...state.keys()]).toEqual(['2.2.2.2']);
  });

  it('never exceeds the key cap', () => {
    for (let i = 0; i < MAX_TRACKED_KEYS + 100; i++) {
      vi.advanceTimersByTime(1);
      fail(`10.0.0.${i}`);
    }

    expect(state.size).toBe(MAX_TRACKED_KEYS);
    // The newest key survives; the quietest ones were evicted.
    expect(state.has(`10.0.0.${MAX_TRACKED_KEYS + 99}`)).toBe(true);
    expect(state.has('10.0.0.0')).toBe(false);
  });
});

describe('isRateLimited', () => {
  it.each([
    [{ status: 429, code: 'over_request_rate_limit' }, true],
    [{ status: 429, code: undefined }, true],
    [{ status: undefined, code: 'over_request_rate_limit' }, true],
    [{ status: 400, code: 'invalid_credentials' }, false],
    [{ status: undefined, code: undefined }, false],
  ])('reads %o as %s', (error, expected) => {
    expect(isRateLimited(error)).toBe(expected);
  });
});

describe('clientKey', () => {
  it('takes the first x-forwarded-for hop', async () => {
    headerValue.current = ' 3.3.3.3 , 10.0.0.1';

    await expect(clientKey()).resolves.toBe('3.3.3.3');
  });

  it.each([null, '', '  '])('falls back on %o', async (value) => {
    headerValue.current = value;

    await expect(clientKey()).resolves.toBe('unknown');
  });
});

describe('reportAuthFailure', () => {
  it('reports the burst name and nothing else', async () => {
    headerValue.current = '4.4.4.4';
    for (let i = 0; i < FAILURE_THRESHOLD; i++) await reportAuthFailure();

    expect(captureSecurityEvent.mock.calls).toEqual([
      ['auth.sign_in_failure_burst'],
    ]);
  });
});
