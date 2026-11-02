import { safeRedirectPath } from '@/lib/safeRedirectPath';
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const rurl = safeRedirectPath(request.nextUrl.searchParams.get('rurl'));

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=oauth_failed', request.url),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'oauth_failed');
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL(rurl ?? '/', request.url));
}
