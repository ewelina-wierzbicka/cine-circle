import { defineConfig, devices } from '@playwright/test';
import './e2e/env';

// Use a dedicated test port (3001) so the e2e server never conflicts with
// the developer's main dev server on 3000. The test server inherits the
// playwright process env (which has local Supabase from .env.test.local),
// ensuring auth operations hit the right instance.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3001';
const testPort = new URL(baseURL).port || '3001';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // 6 parallel workers against a Turbopack dev server + local Supabase can
  // push a single test past the 30s default when routes still need compiling.
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // NEXT_DIST_DIR keeps the e2e server's .next-e2e separate from the main
    // dev server's .next, avoiding the dev/lock conflict when both run at once.
    command: `NEXT_DIST_DIR=.next-e2e npm run dev -- -p ${testPort}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    // process.env values can be undefined; Playwright requires strings.
    env: Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => entry[1] !== undefined,
      ),
    ),
  },
});
