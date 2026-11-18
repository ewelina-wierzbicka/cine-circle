import { createHmac, timingSafeEqual } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';

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
  const body = await request.text();

  if (secret) {
    const svixId = request.headers.get('svix-id') ?? '';
    const svixTimestamp = request.headers.get('svix-timestamp') ?? '';
    const svixSignature = request.headers.get('svix-signature') ?? '';

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: 'Missing signature headers' },
        { status: 400 },
      );
    }

    const timestampMs = Number(svixTimestamp) * 1000;
    const fiveMinutes = 5 * 60 * 1000;
    if (Math.abs(Date.now() - timestampMs) > fiveMinutes) {
      return NextResponse.json(
        { error: 'Timestamp out of range' },
        { status: 400 },
      );
    }

    if (!verifySignature(secret, svixId, svixTimestamp, body, svixSignature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
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
              html: `<p><strong>From:</strong> ${from}<br><strong>To:</strong> ${to.join(', ')}<br><strong>Subject:</strong> ${subject}</p><hr>${bodyHtml}`,
            }
          : {
              text: `From: ${from}\nTo: ${to.join(', ')}\nSubject: ${subject}\n\n${bodyText ?? '(no body)'}`,
            }),
      }),
    });
  }

  return NextResponse.json({ received: true });
}
