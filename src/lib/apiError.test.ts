// @vitest-environment node
// Pure logic, no DOM: the default jsdom environment costs seconds of
// setup per file and buys nothing here.
import { describe, expect, it } from 'vitest';
import { apiError } from '@/lib/apiError';

describe('apiError', () => {
  it('returns the status and a JSON { error } body', async () => {
    const response = apiError('Invalid signature', 401);

    expect(response.status).toBe(401);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(await response.json()).toEqual({ error: 'Invalid signature' });
  });
});
