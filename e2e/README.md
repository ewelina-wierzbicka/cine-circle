# E2E tests

Playwright suite. Runs against remote Supabase by default (`.env.local`).

```bash
npx playwright test
```

## Running the full email-click reset test (T10)

`auth.spec.ts` T10 clicks the real reset link from the inbox. That needs a
readable mailbox, so it runs only against **local Supabase** (Mailpit). It
self-skips when `E2E_MAILPIT_URL` is unset.

1. Start the local stack (Mailpit is the bundled inbox on port 54324):

   ```bash
   npx supabase start
   ```

2. Create `.env.test.local` (gitignored) pointing the suite and app at it.
   `supabase start` prints the URL and keys:

   ```
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
   SUPABASE_SECRET_KEY=<secret key>
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   E2E_MAILPIT_URL=http://127.0.0.1:54324
   ```

   `NEXT_PUBLIC_SITE_URL` must be `localhost` (the host Playwright uses) so the
   session cookie set by the reset callback is sent back. `localhost:3000` is
   allow-listed in `supabase/config.toml`.

3. Run:

   ```bash
   npx playwright test auth.spec.ts
   ```

`e2e/env.ts` loads `.env.test.local` before `.env.local`, and Playwright's
`webServer` (`npm run dev`) inherits the vars, so the whole app points at local
Supabase for the run.
