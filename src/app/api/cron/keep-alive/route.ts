import { timingSafeEqual } from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';

import { captureSecurityEvent } from '@/lib/captureSecurityEvent';
import { adminSupabase } from '@/lib/supabase/admin';

function isAuthorized(secret: string, header: string | null): boolean {
  if (!header) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);

  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

// Supabase Free pauses a project after 7 days of no activity. Vercel cron hits
// this daily so the project never gets there. Must stay uncached: a cached
// response would never reach the database.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret || !isAuthorized(secret, request.headers.get('authorization'))) {
    captureSecurityEvent('cron.keep_alive_unauthorized');
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { error } = await adminSupabase
    .from('profiles')
    .select('id', { head: true, count: 'exact' });

  if (error) {
    console.error('[keep-alive ping failed]', error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
