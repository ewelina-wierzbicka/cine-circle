# E2E tests

Playwright suite. Runs against remote Supabase by default (`.env.local`).

```bash
npx playwright test
```

## Password reset coverage

`auth.spec.ts` T9 proves the reset outcome without an email inbox: it drives a
real recovery-token session via the admin API (`resetPasswordViaRecovery` in
`e2e/admin.ts`), the same Supabase change the `/reset-password` form makes, then
verifies the new password logs in and the old one fails. No Mailpit or local
stack required, so it runs unchanged in CI against remote Supabase.
