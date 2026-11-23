import type { AuthError } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { captureSecurityEvent } from '@/lib/captureSecurityEvent';

export const FAILURE_THRESHOLD = 10;
export const WINDOW_MS = 10 * 60 * 1000;
export const MAX_TRACKED_KEYS = 500;

const UNKNOWN_CLIENT = 'unknown';

export type FailureWindow = { timestamps: number[]; fired: boolean };

const windows = new Map<string, FailureWindow>();

function lastSeen(window: FailureWindow): number {
  return window.timestamps[window.timestamps.length - 1] ?? 0;
}

function evictExpired(state: Map<string, FailureWindow>, now: number): void {
  for (const [key, window] of state) {
    if (now - lastSeen(window) >= WINDOW_MS) state.delete(key);
  }
}

// Every survivor is inside the window, so the cap can only bite under a
// spread-out flood. Dropping the quietest key is the right trade there.
function enforceCap(state: Map<string, FailureWindow>, keep: string): void {
  if (state.size <= MAX_TRACKED_KEYS) return;

  const evictable = [...state.entries()]
    .filter(([key]) => key !== keep)
    .sort(([, a], [, b]) => lastSeen(a) - lastSeen(b))
    .slice(0, state.size - MAX_TRACKED_KEYS);

  for (const [key] of evictable) state.delete(key);
}

// True at most once per key per window: the flag holds while the key stays over
// threshold and re-arms once it drops back under.
export function recordFailure(
  state: Map<string, FailureWindow>,
  key: string,
  now: number,
): boolean {
  evictExpired(state, now);

  const previous = state.get(key);
  const timestamps = [...(previous?.timestamps ?? []), now]
    .filter((at) => now - at < WINDOW_MS)
    .slice(-FAILURE_THRESHOLD);

  const tripped = timestamps.length >= FAILURE_THRESHOLD;
  state.set(key, { timestamps, fired: tripped });
  enforceCap(state, key);

  return tripped && !(previous?.fired ?? false);
}

// Vercel sets x-forwarded-for. With no header every caller shares one bucket,
// so a burst still aggregates instead of counting nothing. The key is a map
// key only and never reaches Sentry.
export async function clientKey(): Promise<string> {
  const forwarded = (await headers()).get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || UNKNOWN_CLIENT;
}

export function isRateLimited(
  error: Pick<AuthError, 'status' | 'code'>,
): boolean {
  return error.status === 429 || error.code === 'over_request_rate_limit';
}

export async function reportAuthFailure(): Promise<void> {
  if (recordFailure(windows, await clientKey(), Date.now()))
    captureSecurityEvent('auth.sign_in_failure_burst');
}
