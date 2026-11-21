// @vitest-environment node
import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import manifest from '@/app/manifest';
import proxy from '@/proxy';

// The root layout loads its fonts through the Next compiler, which vitest
// does not run. Only `viewport` is read here.
vi.mock('next/font/google', () => {
  const font = () => ({ className: '', variable: '', style: {} });
  return { DM_Mono: font, DM_Sans: font, DM_Serif_Display: font };
});

// A signed-out visitor: the proxy's Supabase client finds no user.
vi.mock('@supabase/ssr', () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

async function signedOutRedirect(path: string) {
  const response = await proxy(new NextRequest(`http://localhost${path}`));
  return response.headers.get('location');
}

describe('manifest', () => {
  // A private start_url would send a signed-out install to /login.
  it.each(['start_url', 'scope'] as const)(
    '%s is an open route',
    async (field) => {
      const path = manifest()[field];
      expect(path).toBeDefined();
      expect(await signedOutRedirect(path ?? '')).toBeNull();
    },
  );

  it('redirects a signed-out private route, so the check can fail', async () => {
    expect(await signedOutRedirect('/profile')).toBe(
      'http://localhost/login?rurl=%2Fprofile',
    );
  });

  it('matches the root layout themeColor', async () => {
    const { viewport } = await import('@/app/layout');
    expect(manifest().theme_color).toBe(viewport.themeColor);
  });
});
