import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=confirm_failed', request.url),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'confirm_failed');
    return NextResponse.redirect(url);
  }

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/registration-confirmed', request.url));
}
