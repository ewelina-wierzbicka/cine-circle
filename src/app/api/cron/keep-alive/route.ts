import { type NextRequest, NextResponse } from 'next/server';

import { adminSupabase } from '@/lib/supabase/admin';

// Supabase Free pauses a project after 7 days of no activity. Vercel cron hits
// this daily so the project never gets there. Must stay uncached: a cached
// response would never reach the database.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;

  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { error } = await adminSupabase
    .from('profiles')
    .select('id', { head: true, count: 'exact' });

  if (error) {
    console.error('[keep-alive ping failed]', error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
