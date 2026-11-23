// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { captureSecurityEvent } from '@/lib/captureSecurityEvent';

const { captureMessage } = vi.hoisted(() => ({ captureMessage: vi.fn() }));

vi.mock('@sentry/nextjs', () => ({ captureMessage }));

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'production');
});

afterEach(() => {
  captureMessage.mockClear();
  vi.unstubAllEnvs();
});

describe('captureSecurityEvent', () => {
  // The DSN is unconditional, so the e2e suite would otherwise fire the alert.
  it.each(['development', 'test'])('sends nothing in %s', (env) => {
    vi.stubEnv('NODE_ENV', env as 'development' | 'test');
    captureSecurityEvent('cron.keep_alive_unauthorized');

    expect(captureMessage).not.toHaveBeenCalled();
  });

  it('reports the event name at warning level, tagged security', () => {
    captureSecurityEvent('cron.keep_alive_unauthorized');

    expect(captureMessage).toHaveBeenCalledWith(
      'cron.keep_alive_unauthorized',
      {
        level: 'warning',
        tags: {
          security: true,
          security_event: 'cron.keep_alive_unauthorized',
        },
      },
    );
  });

  // The payload is the name and the tags. Anything else risks shipping PII.
  it('sends no other fields', () => {
    captureSecurityEvent('email.inbound_invalid_signature');

    const [message, context] = captureMessage.mock.calls[0];
    expect(message).toBe('email.inbound_invalid_signature');
    expect(Object.keys(context as object).sort()).toEqual(['level', 'tags']);
  });
});
