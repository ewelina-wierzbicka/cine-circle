import { createHmac, timingSafeEqual } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';

interface ResendInboundEmail {
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
  attachments?: Array<{ filename: string; content: string }>;
}

interface ResendInboundPayload {
  type: 'email.received';
  created_at: string;
  data: ResendInboundEmail;
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

  const { from, to, subject } = payload.data;
  console.warn('[inbound email received]', { from, to, subject });

  return NextResponse.json({ received: true });
}
