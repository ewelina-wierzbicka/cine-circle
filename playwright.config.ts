import { defineConfig, devices } from '@playwright/test';
import './e2e/env';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
// `next dev` ignores the url we wait on, so the port has to be passed
// explicitly or the server boots on 3000 and the wait times out.
const port = new URL(baseURL).port || '3000';

export default defineConfig({
  testDir: './e2e',
  // Auth-gated routes compile on their first in-test request; 30s was not
  // enough for a cold `next dev` to serve /collection or /profile.
  timeout: 60_000,
  // One dev server serves every worker, so assertions that wait on a
  // round trip (avatar upload, signed URL) need more than the 5s default.
  expect: { timeout: 15_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
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
    command: `npm run dev -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    // A cold Turbopack boot plus the proxy compile can pass two minutes.
    timeout: 300_000,
  },
});
