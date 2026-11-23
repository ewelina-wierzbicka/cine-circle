import { captureSecurityEvent } from '@/lib/captureSecurityEvent';
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    captureSecurityEvent('auth.reset_callback_missing_code');
    return NextResponse.redirect(
      new URL('/login?error=reset_failed', request.url),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    captureSecurityEvent('auth.reset_callback_exchange_failed');
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'reset_failed');
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL('/reset-password', request.url));
}
