// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureSecurityEvent } from '@/lib/captureSecurityEvent';

const { captureMessage } = vi.hoisted(() => ({ captureMessage: vi.fn() }));

vi.mock('@sentry/nextjs', () => ({ captureMessage }));

afterEach(() => {
  captureMessage.mockClear();
});

describe('captureSecurityEvent', () => {
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
