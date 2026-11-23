# Security runbook

What protects MidnightFrame, which alert reaches whom, and what to do when one fires.

Public disclosure policy for reporters: [`SECURITY.md`](../SECURITY.md) in the repo root. This file is the operator side.

Settings state below was read from the GitHub API on 2026-11-23. Re-read it before trusting a row.

---

## 1. What protects the app today

| Layer                     | Where it lives                                                   | What breaks if it goes                                                                        |
| ------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Security headers and CSP  | `next.config.ts`, one `headers()` entry on `/:path*`             | The browser stops blocking third-party script and frame loads                                 |
| Header regression test    | `src/lib/securityHeaders.test.ts`                                | A dropped directive ships silently. The test runs in `checks.yml`                             |
| Auth gate                 | `src/proxy.ts`                                                   | Private routes render for anyone. A route missing from the known-route list is already public |
| Row Level Security        | `supabase/migrations/`, asserted by `e2e/rls.spec.ts`            | Any signed-in user can read another user's collection                                         |
| Service role key          | `SUPABASE_SECRET_KEY`, server only, `lib/supabase/admin.ts`      | Full database access from the browser. It must never gain a `NEXT_PUBLIC_` prefix             |
| Cron authentication       | `CRON_SECRET`, checked in `api/cron/keep-alive/route.ts`         | Anyone can trigger the ping. Worse: if unset, Vercel sends no header and every run 401s       |
| Webhook signature         | `RESEND_WEBHOOK_SECRET`, checked in `api/email/inbound/route.ts` | Anyone can post forged inbound email to the handler                                           |
| Secret scanning           | GitHub repository settings                                       | A committed key stays committed. Push protection blocks most of them up front                 |
| Encrypted backups         | `.github/workflows/backup.yml`, see [`BACKUPS.md`](BACKUPS.md)   | No recovery path on the Supabase Free plan                                                    |
| Error reports without PII | `instrumentation-client.ts`, `sentry.server.config.ts`           | `userInfo: false` and `httpBodies: []`. Turning either on sends user data to Sentry           |

The CSP is not restated here. Read `next.config.ts` — the comment block at the top says where each allowed origin comes from, and the test next to it says which directives are load-bearing.

**This repository is public.** Everything above is readable by anyone. That is fine for configuration and fatal for a credential, which is why section 4.1 exists.

---

## 2. Alert channels

| Channel                            | What it means                                                                | Where it lands                                        | First response                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Secret scanning alert              | A credential pattern was found in the repository or its history              | GitHub → Security → Secret scanning, plus owner email | 4.1                                                                                           |
| Push protection block              | A push was rejected because it contained a credential. Nothing leaked yet    | The failed `git push` output                          | 4.1, minus the rotation if it never landed                                                    |
| Snyk PR check failure              | A changed dependency manifest brought in a known vulnerability               | The PR check, plus the Snyk org `ewierzbicka3`        | 4.2                                                                                           |
| Dependabot alert                   | A dependency has a known CVE                                                 | GitHub → Security → Dependabot                        | 4.2                                                                                           |
| Private vulnerability report       | An outside reporter found something                                          | GitHub → Security → Advisories, plus owner email      | 4.3                                                                                           |
| `Checks` workflow failure          | Lint, type-check or the unit suite broke on `main` or a PR                   | GitHub Actions, plus email on the `main` run          | Read the job log. A failing `securityHeaders.test.ts` means a header changed                  |
| `Playwright` workflow failure      | An end-to-end path broke. `rls.spec.ts` failing is an access-control failure | GitHub Actions                                        | 4.6 if it is an `rls.spec.ts` case                                                            |
| `Supabase backup` workflow failure | No usable backup was produced last night                                     | GitHub Actions, email on scheduled-run failure        | 4.4                                                                                           |
| Sentry issue alert                 | A runtime error in the browser, server or edge runtime                       | Sentry project `midnightframe`, org `ewierzbicka`     | 4.5                                                                                           |
| Vercel deployment failure          | A build or deployment did not go out                                         | Vercel dashboard and its notification settings        | Read the build log. The previous deployment stays live                                        |
| Vercel cron failure                | `/api/cron/keep-alive` is not returning 200                                  | Vercel → Cron Jobs → the invocation log               | Check `CRON_SECRET` exists in Production. A 401 every run ends with a paused Supabase project |
| Supabase project paused            | Roughly 7 days of low activity on the Free plan                              | Supabase dashboard and its email                      | Resume the project, then check why the keep-alive cron stopped working                        |

### Channels that do not exist

Know these gaps before relying on the table above.

- **No CSP violation reporting.** There is no `report-uri` or `report-to`, so a directive that blocks something legitimate shows up as a broken feature, not as an alert. `securityHeaders.test.ts` covers the opposite failure, a directive going missing.
- **No alert for a successful attack.** There is no WAF, no rate limiting, no auth-failure threshold and no audit-log review. A credential-stuffing run against `/login` is invisible.
- **No SAST.** Nothing scans this project's own code for vulnerable patterns. No CodeQL workflow, no `dependabot.yml`. Snyk is dependency scanning, and it reports on a pull request that touches a manifest, not on the dependency set of the running deployment.
- **Nobody is paged.** Every channel above is an email or a dashboard badge, read on a hobby schedule. Check the Actions tab and the Sentry inbox monthly regardless of whether anything arrived.

---

## 3. Settings that must stay on

### GitHub

| Setting                              | Required | State on 2026-11-23 |
| ------------------------------------ | -------- | ------------------- |
| Secret scanning                      | Yes      | Enabled             |
| Push protection                      | Yes      | Enabled             |
| Dependabot alerts                    | Yes      | **Disabled**        |
| Dependabot security updates          | Yes      | **Disabled**        |
| Private vulnerability reporting      | Yes      | **Disabled**        |
| Two-factor auth on the owner account | Yes      | Verify by hand      |
| Snyk GitHub app installed            | Yes      | Enabled             |
| Branch protection on `main`          | Wanted   | **None**            |

Private vulnerability reporting being disabled is why `SECURITY.md` currently advertises a reporting form that is not switched on. Turn the three disabled rows on at repository → Settings → Advanced Security; private vulnerability reporting is one checkbox on the same page. Snyk covering dependencies on pull requests is not a substitute for Dependabot alerts: a CVE published tomorrow against a package nobody is editing produces no Snyk check run.

Secrets used by CI, all four required by the backup workflow: `SUPABASE_DB_URL`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_BACKUP_AGE_KEY`. Playwright needs `TMDB_TOKEN` and the `NEXT_PUBLIC_SITE_URL` repository variable. Never add a secret the unit suite would need: `checks.yml` runs with none, and that is deliberate.

### Vercel

- `CRON_SECRET` set in Production, or the cron 401s every run and Supabase pauses silently.
- `SUPABASE_SECRET_KEY`, `TMDB_TOKEN`, `RESEND_API_KEY` and `RESEND_WEBHOOK_SECRET` are server-only. Confirm none of them is exposed to the browser: only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` may carry that prefix.
- `NEXT_PUBLIC_SITE_URL` set in every environment, or `metadataBase` falls back to localhost.
- HTTPS only. `Strict-Transport-Security` in `next.config.ts` has a two-year `max-age` with `preload`, so a downgrade to plain HTTP is not recoverable for existing visitors.
- Two-factor auth on the account.

### Supabase

- RLS enabled on every table, including new ones. A migration that creates a table without a policy is an access-control bug, and `e2e/rls.spec.ts` is where the proof goes.
- `deleted_accounts` stays service-role-only with deny-all RLS.
- The `avatar` bucket stays private, read and write scoped to `{user_id}/`.
- Email confirmation stays on for password signups.
- Google OAuth redirect URLs limited to the live domain and localhost.
- Two-factor auth on the account. The Supabase account holds the data and, on the Free plan, the only live copy.

---

## 4. First response

### 4.1 Leaked credential

1. **Rotate first, investigate second.** A key in a public repository is compromised the moment it is pushed, regardless of how fast the commit was deleted.
2. Rotate at the source: Supabase keys in Dashboard → Settings → API, TMDB token in the TMDB account, `CRON_SECRET` and the Resend keys by generating new values.
3. Update Vercel environment variables, the GitHub repository secrets, and your local `.env.local`.
4. Redeploy, then confirm the app still works: sign in, open a media page, run the keep-alive cron manually.
5. Only then clean up the history. Rewriting it does not un-leak anything.
6. If a Supabase key leaked, read the logs for the window it was valid and check `auth.users` and `user_media` for rows you cannot explain.
7. Close the alert with a note saying which key was rotated and when.

### 4.2 Dependency CVE

1. Read the advisory. Decide whether the vulnerable path is reachable from this app at all.
2. Reachable, or unclear: bump it. `npm audit fix` for the simple case, a manual version bump plus `npm run lint && npm run type-check && npm run test` otherwise.
3. Not reachable (a dev-only transitive dependency, for example): say so in the alert dismissal, with the reason.
4. A major bump to `next`, `react` or `@supabase/*` is its own PR, never a drive-by fix.
5. A Snyk check that failed on a PR blocks that PR only. Fix it in the same branch, and do not merge past it on the grounds that the finding is old.

### 4.3 Vulnerability report from outside

1. Acknowledge within 7 days. Do not negotiate severity before reproducing it.
2. Reproduce against a local stack (`npx supabase db reset`), never against production data.
3. Fix on a branch, add the regression test next to the fix, and keep the advisory private until the fix is deployed.
4. Access-control bugs get an `rls.spec.ts` or `proxy` test. Header and CSP regressions get a case in `securityHeaders.test.ts`.
5. Publish the advisory after deployment, credit the reporter if they want it.

### 4.4 Backup workflow failure

Full detail in [`BACKUPS.md`](BACKUPS.md) sections 2 and 3. Short version: read the step summary. Missing secrets fail on the first step. `Network is unreachable` means the direct database host was used instead of the session pooler. A dump that cannot connect at all usually means the Supabase project paused.

### 4.5 Sentry issue

1. Triage by shape, not by count: a server-side error in a route handler or a server action outranks a browser noise spike.
2. Errors mentioning Supabase row access, `getCurrentUser` or `admin.ts` are treated as potential access-control bugs, not as crashes.
3. Nothing in a Sentry payload should contain user data. If it does, that is itself an incident: check `dataCollection` in `instrumentation-client.ts` and `sentry.server.config.ts`.
4. A sudden flood of CSP-adjacent errors after a dependency change usually means a new third-party origin was added without updating `next.config.ts`.

### 4.6 Suspected cross-account access

1. Run the access-control suite first: `npx playwright test e2e/rls.spec.ts`. It asserts that another user cannot read, write or delete someone else's rows or avatar objects.
2. Failing: the policy is the bug. Fix the migration, not the query. A client-side filter is not a fix.
3. Passing but the report stands: the leak is above the database. Check whether the route is in the known-route list in `proxy.ts`, and whether the handler uses the admin client where it should use the server client.
4. Either way, assume the data was read. Section 4.1 step 6 applies.

---

## 5. Where each credential lives

| Credential                                | Lives in                                                | Rotate at                               |
| ----------------------------------------- | ------------------------------------------------------- | --------------------------------------- |
| `SUPABASE_SECRET_KEY`                     | Vercel, GitHub secrets, `.env.local`                    | Supabase → Settings → API               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`           | Vercel, `.env.local`. Public by design, still rotatable | Supabase → Settings → API               |
| `TMDB_TOKEN`                              | Vercel, GitHub secrets, `.env.local`                    | TMDB account settings                   |
| `CRON_SECRET`                             | Vercel Production only                                  | Generate a new random value             |
| `RESEND_API_KEY`, `RESEND_WEBHOOK_SECRET` | Vercel, `.env.local`                                    | Resend dashboard                        |
| `SUPABASE_DB_URL`                         | GitHub secrets                                          | Changes with the database password      |
| `SUPABASE_BACKUP_AGE_KEY`                 | GitHub secrets (public key only)                        | New key pair, see `BACKUPS.md`          |
| Google OAuth client secret                | Supabase project config, `.env.local`                   | Google Cloud console                    |
| Sentry DSN                                | Committed in the Sentry config files                    | Not a secret. A DSN only accepts events |

The age **private** key is never in CI and never in the repository. Losing it makes every backup unrecoverable.

---

## 6. Recommendation

In order, cheapest first:

1. **Enable Dependabot alerts, Dependabot security updates and private vulnerability reporting.** Three checkboxes, no cost. Until the third one is on, the reporting link in `SECURITY.md` does not work.
2. **Enable two-factor auth on GitHub, Vercel and Supabase** if it is not already on. The Supabase account is the single point of failure for the data.
3. **Protect `main`**: require `Checks` to pass before merge. The regression tests only help if they cannot be bypassed.
4. **Add a CSP reporting endpoint** when there is appetite for the noise. It is the only way a broken directive becomes an alert instead of a bug report.
5. **Revisit rate limiting** if sign-ups ever come from outside a friend group. Nothing today limits login attempts.
