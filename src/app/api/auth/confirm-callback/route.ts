import { type NextRequest, NextResponse } from 'next/server';

import { captureSecurityEvent } from '@/lib/captureSecurityEvent';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    captureSecurityEvent('auth.confirm_callback_missing_code');
    return NextResponse.redirect(
      new URL('/login?error=confirm_failed', request.url),
    );
  }

  return NextResponse.redirect(new URL('/registration-confirmed', request.url));
}
