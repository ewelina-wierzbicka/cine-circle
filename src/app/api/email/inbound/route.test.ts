// @vitest-environment node
import { createHmac } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/email/inbound/route';

const SECRET = 'whsec_c2VjcmV0LWtleS1ieXRlcw==';
const SVIX_ID = 'msg_1';
const EMAIL_ID = '1d1b2d4e-8e2f-4a7b-9c3d-5f6a7b8c9d0e';

const fetchMock = vi.fn<typeof fetch>();
const captureSecurityEvent = vi.fn<(event: string) => void>();

vi.mock('@/lib/captureSecurityEvent', () => ({
  captureSecurityEvent: (event: string) => captureSecurityEvent(event),
}));

const payload = {
  type: 'email.received',
  created_at: '2026-11-21T00:00:00Z',
  data: {
    email_id: EMAIL_ID,
    from: 'sender@example.com',
    to: ['hello@midnightframe.app'],
    subject: 'Hi',
  },
};

/** The signature header Resend would send for this body. */
function sign(body: string, timestamp: string, secret = SECRET) {
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const mac = createHmac('sha256', key)
    .update(`${SVIX_ID}.${timestamp}.${body}`)
    .digest('base64');
  return `v1,${mac}`;
}

/** Headers default to a valid signature, so each test opts out explicitly. */
function post(
  body: unknown,
  headers: Record<string, string> = signedHeaders(body),
): Promise<Response> {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return POST(
    new Request('https://midnightframe.app/api/email/inbound', {
      method: 'POST',
      body: text,
      headers,
    }) as unknown as NextRequest,
  );
}

/** Signed headers for `body`, with the timestamp `offsetMs` from now. */
function signedHeaders(body: unknown, offsetMs = 0) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  const timestamp = String(Math.floor((Date.now() + offsetMs) / 1000));
  return {
    'svix-id': SVIX_ID,
    'svix-timestamp': timestamp,
    'svix-signature': sign(text, timestamp),
  };
}

beforeEach(() => {
  fetchMock.mockResolvedValue(Response.json({ text: 'body text' }));
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('RESEND_WEBHOOK_SECRET', SECRET);
});

afterEach(() => {
  fetchMock.mockReset();
  captureSecurityEvent.mockClear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const sendCalls = () =>
  fetchMock.mock.calls.filter(
    ([input]) => String(input) === 'https://api.resend.com/emails',
  );

const sentBody = () =>
  JSON.parse(String(sendCalls()[0][1]?.body)) as Record<string, string>;

describe('POST /api/email/inbound', () => {
  describe('signature verification', () => {
    beforeEach(() => {
      vi.stubEnv('RESEND_NOTIFICATION_EMAIL', '');
      vi.stubEnv('RESEND_API_KEY', '');
    });

    it.each([
      ['svix-id', 'svix-id'],
      ['svix-timestamp', 'svix-timestamp'],
      ['svix-signature', 'svix-signature'],
    ])('400s with %s missing', async (_, header) => {
      const headers: Record<string, string> = signedHeaders(payload);
      delete headers[header];

      const response = await post(payload, headers);
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: 'Missing signature headers',
      });
      expect(captureSecurityEvent).toHaveBeenCalledWith(
        'email.inbound_missing_signature_headers',
      );
    });

    it.each([
      ['six minutes old', -6 * 60 * 1000],
      ['six minutes ahead', 6 * 60 * 1000],
    ])('400s on a timestamp %s', async (_, offsetMs) => {
      const response = await post(payload, signedHeaders(payload, offsetMs));

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: 'Timestamp out of range',
      });
      expect(captureSecurityEvent).toHaveBeenCalledWith(
        'email.inbound_timestamp_out_of_range',
      );
    });

    it.each([
      ['four minutes old', -4 * 60 * 1000],
      ['four minutes ahead', 4 * 60 * 1000],
    ])('accepts a timestamp %s', async (_, offsetMs) => {
      const response = await post(payload, signedHeaders(payload, offsetMs));
      expect(response.status).toBe(200);
      expect(captureSecurityEvent).not.toHaveBeenCalled();
    });

    it('401s on a signature from another secret', async () => {
      const timestamp = String(Math.floor(Date.now() / 1000));
      const response = await post(payload, {
        'svix-id': SVIX_ID,
        'svix-timestamp': timestamp,
        'svix-signature': sign(
          JSON.stringify(payload),
          timestamp,
          'whsec_b3RoZXI=',
        ),
      });

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({
        error: 'Invalid signature',
      });
      expect(captureSecurityEvent).toHaveBeenCalledWith(
        'email.inbound_invalid_signature',
      );
    });

    it('401s when the body no longer matches the signature', async () => {
      const headers = signedHeaders(payload);
      const response = await post(
        { ...payload, created_at: 'tampered' },
        headers,
      );

      expect(response.status).toBe(401);
    });

    it('401s on a malformed signature header', async () => {
      const response = await post(payload, {
        ...signedHeaders(payload),
        'svix-signature': 'not-base64-at-all',
      });

      expect(response.status).toBe(401);
    });

    // svix-signature carries space-separated v1,<base64> pairs during rotation.
    it('accepts one valid signature among several', async () => {
      const headers = signedHeaders(payload);
      const response = await post(payload, {
        ...headers,
        'svix-signature': `v1,d3Jvbmc= ${headers['svix-signature']}`,
      });

      expect(response.status).toBe(200);
    });

    // The secret is base64 after the whsec_ prefix; keeping the prefix in the
    // HMAC key would make every real Resend signature fail.
    it('strips the whsec_ prefix from the key', async () => {
      const timestamp = String(Math.floor(Date.now() / 1000));
      const body = JSON.stringify(payload);
      const key = Buffer.from(SECRET, 'base64');
      const mac = createHmac('sha256', key)
        .update(`${SVIX_ID}.${timestamp}.${body}`)
        .digest('base64');

      const response = await post(payload, {
        'svix-id': SVIX_ID,
        'svix-timestamp': timestamp,
        'svix-signature': `v1,${mac}`,
      });

      expect(response.status).toBe(401);
    });
  });

  // The route sits outside the proxy matcher, so an unverified POST would be
  // an open relay on our Resend quota. It has to fail closed.
  it.each([
    ['unset', undefined],
    ['empty', ''],
  ])('500s and sends nothing with the secret %s', async (_, value) => {
    vi.stubEnv('RESEND_WEBHOOK_SECRET', value);
    vi.stubEnv('RESEND_NOTIFICATION_EMAIL', 'owner@example.com');
    vi.stubEnv('RESEND_API_KEY', 'key');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await post(payload);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: 'Webhook verification unavailable',
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(1);
    expect(captureSecurityEvent).toHaveBeenCalledWith(
      'email.inbound_missing_secret',
    );
    error.mockRestore();
  });

  it('400s on a body that is not JSON', async () => {
    const response = await post('not json');

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON' });
  });

  it('ignores an event that is not email.received', async () => {
    vi.stubEnv('RESEND_NOTIFICATION_EMAIL', 'owner@example.com');
    vi.stubEnv('RESEND_API_KEY', 'key');

    const response = await post({ ...payload, type: 'email.delivered' });

    await expect(response.json()).resolves.toEqual({ received: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  describe('forwarding', () => {
    beforeEach(() => {
      vi.stubEnv('RESEND_NOTIFICATION_EMAIL', 'owner@example.com');
      vi.stubEnv('RESEND_API_KEY', 'key');
    });

    it.each([
      ['notification address', 'RESEND_NOTIFICATION_EMAIL'],
      ['API key', 'RESEND_API_KEY'],
    ])('sends nothing with no %s', async (_, name) => {
      vi.stubEnv(name, '');
      const response = await post(payload);

      expect(response.status).toBe(200);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('fetches the body, then forwards it as HTML', async () => {
      fetchMock.mockResolvedValueOnce(
        Response.json({ html: '  <p>Hello</p>  ', text: 'Hello' }),
      );
      await post(payload);

      expect(String(fetchMock.mock.calls[0][0])).toBe(
        `https://api.resend.com/emails/receiving/${EMAIL_ID}`,
      );
      const body = sentBody();
      expect(body.html).toContain('<p>Hello</p>');
      expect(body.html).toContain('sender@example.com');
      expect(body.text).toBeUndefined();
    });

    it('falls back to the text body when there is no HTML', async () => {
      fetchMock.mockResolvedValueOnce(Response.json({ text: ' Hello ' }));
      await post(payload);

      const body = sentBody();
      expect(body.html).toBeUndefined();
      expect(body.text).toContain('Hello');
    });

    it('says (no body) when the content fetch fails', async () => {
      fetchMock.mockResolvedValueOnce(
        Response.json({ error: 'nope' }, { status: 404 }),
      );
      await post(payload);

      expect(sentBody().text).toContain('(no body)');
    });

    it('replies to the sender and defaults the from address', async () => {
      vi.stubEnv('RESEND_FROM_EMAIL', undefined);
      await post(payload);

      expect(sentBody()).toMatchObject({
        from: 'noreply@midnightframe.app',
        to: ['owner@example.com'],
        reply_to: 'sender@example.com',
        subject: 'New email from sender@example.com: Hi',
      });
    });

    it('uses RESEND_FROM_EMAIL when set', async () => {
      vi.stubEnv('RESEND_FROM_EMAIL', 'mail@midnightframe.app');
      await post(payload);

      expect(sentBody().from).toBe('mail@midnightframe.app');
    });

    // The sender controls these three fields, so raw markup would land in the
    // operator inbox.
    it('escapes the sender-controlled fields in the HTML body', async () => {
      fetchMock.mockResolvedValueOnce(Response.json({ html: '<p>Hi</p>' }));
      await post({
        ...payload,
        data: {
          ...payload.data,
          from: 'a&b@example.com',
          to: ['"quoted"@example.com'],
          subject: '<script>alert(1)</script>',
        },
      });

      const { html } = sentBody();
      expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(html).not.toContain('<script>');
      expect(html).toContain('a&amp;b@example.com');
      expect(html).toContain('&quot;quoted&quot;@example.com');
      // The real body is still passed through as HTML.
      expect(html).toContain('<p>Hi</p>');
    });

    it.each([
      ['a traversal', '../../domains'],
      ['a non-UUID id', 'email-1'],
    ])('400s on %s email_id and fetches nothing', async (_, id) => {
      const response = await post({
        ...payload,
        data: { ...payload.data, email_id: id },
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({
        error: 'Invalid email_id',
      });
      expect(fetchMock).not.toHaveBeenCalled();
      expect(captureSecurityEvent).toHaveBeenCalledWith(
        'email.inbound_invalid_email_id',
      );
    });

    it('skips the content fetch with no email_id', async () => {
      await post({ ...payload, data: { ...payload.data, email_id: '' } });

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(sentBody().text).toContain('(no body)');
    });
  });
});
