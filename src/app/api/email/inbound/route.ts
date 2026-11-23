import { createHmac, timingSafeEqual } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';

import { captureSecurityEvent } from '@/lib/captureSecurityEvent';

interface ResendInboundEmail {
  email_id: string;
  from: string;
  to: string[];
  subject: string;
}

interface ResendInboundPayload {
  type: 'email.received';
  created_at: string;
  data: ResendInboundEmail;
}

interface ResendEmailContent {
  html?: string;
  text?: string;
}

// A non-UUID id would repoint the content fetch, which carries the API key.
const RESEND_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function verifySignature(
  secret: string,
  svixId: string,
  svixTimestamp: string,
  body: string,
  svixSignature: string,
): boolean {
  const signed = `${svixId}.${svixTimestamp}.${body}`;
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const mac = createHmac('sha256', secretBytes).update(signed).digest('base64');

  // svix-signature may contain multiple space-separated "v1,<base64>" pairs
  return svixSignature.split(' ').some((sig) => {
    const b64 = sig.replace(/^v\d+,/, '');
    try {
      return timingSafeEqual(
        Buffer.from(b64, 'base64'),
        Buffer.from(mac, 'base64'),
      );
    } catch {
      return false;
    }
  });
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;

  if (!secret) {
    console.error(
      'RESEND_WEBHOOK_SECRET is not set — rejecting inbound email webhook',
    );
    captureSecurityEvent('email.inbound_missing_secret');
    return NextResponse.json(
      { error: 'Webhook verification unavailable' },
      { status: 500 },
    );
  }

  const svixId = request.headers.get('svix-id') ?? '';
  const svixTimestamp = request.headers.get('svix-timestamp') ?? '';
  const svixSignature = request.headers.get('svix-signature') ?? '';

  if (!svixId || !svixTimestamp || !svixSignature) {
    captureSecurityEvent('email.inbound_missing_signature_headers');
    return NextResponse.json(
      { error: 'Missing signature headers' },
      { status: 400 },
    );
  }

  const timestampMs = Number(svixTimestamp) * 1000;
  const fiveMinutes = 5 * 60 * 1000;
  if (Math.abs(Date.now() - timestampMs) > fiveMinutes) {
    captureSecurityEvent('email.inbound_timestamp_out_of_range');
    return NextResponse.json(
      { error: 'Timestamp out of range' },
      { status: 400 },
    );
  }

  const body = await request.text();

  if (!verifySignature(secret, svixId, svixTimestamp, body, svixSignature)) {
    captureSecurityEvent('email.inbound_invalid_signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: ResendInboundPayload;
  try {
    payload = JSON.parse(body) as ResendInboundPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.type !== 'email.received') {
    return NextResponse.json({ received: true });
  }

  const { email_id, from, to, subject } = payload.data;

  if (email_id && !RESEND_ID.test(email_id)) {
    captureSecurityEvent('email.inbound_invalid_email_id');
    return NextResponse.json({ error: 'Invalid email_id' }, { status: 400 });
  }

  const notifyTo = process.env.RESEND_NOTIFICATION_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const notifyFrom =
    process.env.RESEND_FROM_EMAIL ?? 'noreply@midnightframe.app';
  if (notifyTo && apiKey) {
    // Resend inbound webhook omits body — fetch it separately
    let bodyHtml: string | undefined;
    let bodyText: string | undefined;
    if (email_id) {
      const contentRes = await fetch(
        `https://api.resend.com/emails/receiving/${email_id}`,
        { headers: { Authorization: `Bearer ${apiKey}` } },
      );
      if (contentRes.ok) {
        const content = (await contentRes.json()) as ResendEmailContent;
        bodyHtml = content.html?.trim() || undefined;
        bodyText = content.text?.trim() || undefined;
      }
    }

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: notifyFrom,
        to: [notifyTo],
        reply_to: from,
        subject: `New email from ${from}: ${subject}`,
        ...(bodyHtml
          ? {
              html: `<p><strong>From:</strong> ${escapeHtml(from)}<br><strong>To:</strong> ${escapeHtml(to.join(', '))}<br><strong>Subject:</strong> ${escapeHtml(subject)}</p><hr>${bodyHtml}`,
            }
          : {
              text: `From: ${from}\nTo: ${to.join(', ')}\nSubject: ${subject}\n\n${bodyText ?? '(no body)'}`,
            }),
      }),
    });
  }

  return NextResponse.json({ received: true });
}
