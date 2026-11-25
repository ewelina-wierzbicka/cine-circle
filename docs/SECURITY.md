# Security runbook

What protects MidnightFrame, which alert reaches whom, and what to do when one fires.

Public disclosure policy for reporters: [`SECURITY.md`](../SECURITY.md) in the repo root. This file is the operator side.

Settings state and alert counts below were read from the GitHub API on 2026-11-25. Re-read them before trusting a row.

---

## 1. What protects the app today

| Layer                     | Where it lives                                                                      | What breaks if it goes                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Security headers and CSP  | `next.config.ts`, one `headers()` entry on `/:path*`                                | The browser stops blocking third-party script and frame loads                                      |
| Header regression test    | `src/lib/securityHeaders.test.ts`                                                   | A dropped directive ships silently. The test runs in `checks.yml`                                  |
| Auth gate                 | `src/proxy.ts`                                                                      | Private routes render for anyone. A route missing from the known-route list is already public      |
| Row Level Security        | `supabase/migrations/`, asserted by `e2e/rls.spec.ts`                               | Any signed-in user can read another user's collection                                              |
| Service role key          | `SUPABASE_SECRET_KEY`, server only, `lib/supabase/admin.ts`                         | Full database access from the browser. It must never gain a `NEXT_PUBLIC_` prefix                  |
| Cron authentication       | `CRON_SECRET`, checked in `api/cron/keep-alive/route.ts`                            | Anyone can trigger the ping. Worse: if unset, Vercel sends no header and every run 401s            |
| Webhook signature         | `RESEND_WEBHOOK_SECRET`, checked in `api/email/inbound/route.ts`                    | Anyone can post forged inbound email to the handler                                                |
| Secret scanning           | GitHub repository settings                                                          | A committed key stays committed. Push protection blocks most of them up front                      |
| Encrypted backups         | `.github/workflows/backup.yml`, see [`BACKUPS.md`](BACKUPS.md)                      | No recovery path on the Supabase Free plan                                                         |
| Error reports without PII | `src/instrumentation-client.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` | `userInfo: false` and `httpBodies: []` in all three. Turning either on sends user data to Sentry   |
| CSP violation reports     | `report-uri` and `report-to` in `next.config.ts`                                    | A directive that blocks something real goes back to being a bug report, not an alert               |
| Security-event alerts     | `lib/captureSecurityEvent.ts`, called from rejection branches                       | A bad cron secret or forged webhook stops reaching Sentry. Production only, by design              |
| Auth-failure detection    | `lib/authFailureAlert.ts`, called from `services/auth.ts`                           | A credential-stuffing run against `/login` goes back to being invisible. Alert only, never a block |
| Supply-chain scanning     | `.github/dependabot.yml`, `.github/workflows/security.yml`                          | Weekly dependency PRs, `npm audit` and CodeQL all stop running                                     |

The CSP is not restated here. Read `next.config.ts` — the comment block at the top says where each allowed origin comes from, and the test next to it says which directives are load-bearing.

Supabase Auth rate limits are settled. The numbers and the egress-IP caveat live in the "Auth rate limits" block of `AGENTS.md`, and are not restated here. They are capacity guards, not a security boundary: the auth calls are server actions, so GoTrue sees the Vercel egress IP and every per-IP limit is one pooled bucket.

**This repository is public.** Everything above is readable by anyone. That is fine for configuration and fatal for a credential, which is why section 4.1 exists.

---

## 2. Alert channels

| Channel                            | What it means                                                                | Where it lands                                        | First response                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Secret scanning alert              | A credential pattern was found in the repository or its history              | GitHub → Security → Secret scanning, plus owner email | 4.1                                                                                           |
| Push protection block              | A push was rejected because it contained a credential. Nothing leaked yet    | The failed `git push` output                          | 4.1, minus the rotation if it never landed                                                    |
| Snyk PR check failure              | A changed dependency manifest brought in a known vulnerability               | The PR check, plus the Snyk org `ewierzbicka3`        | 4.2. Advisory: it is not a required check                                                     |
| Dependabot alert                   | A dependency has a known CVE                                                 | GitHub → Security → Dependabot                        | 4.2                                                                                           |
| Dependabot version-update PR       | A routine bump, grouped per `dependabot.yml`. Not a CVE and not an alert     | The pull request list                                 | Read the changelog, let CI decide. A major goes in its own PR                                 |
| Private vulnerability report       | An outside reporter found something                                          | GitHub → Security → Advisories, plus owner email      | 4.3                                                                                           |
| `Checks` workflow failure          | Lint, type-check or the unit suite broke on `main` or a PR                   | GitHub Actions, plus email on the `main` run          | Read the job log. A failing `securityHeaders.test.ts` means a header changed                  |
| `Playwright` workflow failure      | An end-to-end path broke. `rls.spec.ts` failing is an access-control failure | GitHub Actions                                        | 4.6 if it is an `rls.spec.ts` case                                                            |
| `Supabase backup` workflow failure | No usable backup was produced last night                                     | GitHub Actions, email on scheduled-run failure        | 4.4                                                                                           |
| Sentry issue alert                 | A runtime error in the browser, server or edge runtime                       | Sentry project `midnightframe`, org `ewierzbicka`     | 4.5                                                                                           |
| Sentry `SecurityEvent`             | A rejected request, a burst of failed logins, or a GoTrue 429. Not a crash   | Same project, tag `security:true`, level `warning`    | 4.7                                                                                           |
| Sentry CSP report                  | A browser blocked something the policy does not allow                        | Same project, CSP-type issues                         | 4.8                                                                                           |
| CodeQL alert                       | Static analysis found a vulnerable pattern in this project's own code        | GitHub → Security → Code scanning                     | 4.9                                                                                           |
| `Security` workflow failure        | The analysis did not run. Different from a finding: `audit` cannot fail it   | GitHub Actions, the job log                           | Re-run the job. A red `codeql` means no SARIF was uploaded, so the alert list is stale        |
| `Security` workflow `npm audit`    | A lockfile advisory at high or above. Advisory only today                    | GitHub Actions, the `audit` job log                   | 4.2                                                                                           |
| Vercel deployment failure          | A build or deployment did not go out                                         | Vercel dashboard and its notification settings        | Read the build log. The previous deployment stays live                                        |
| Vercel cron failure                | `/api/cron/keep-alive` is not returning 200                                  | Vercel → Cron Jobs → the invocation log               | Check `CRON_SECRET` exists in Production. A 401 every run ends with a paused Supabase project |
| Supabase project paused            | Roughly 7 days of low activity on the Free plan                              | Supabase dashboard and its email                      | Resume the project, then check why the keep-alive cron stopped working                        |

### Board decisions, 2026-11-25

Four questions settled. They are the reason the gaps below are gaps.

- **Auth-failure handling is alert-only.** No soft block, no lockout, no captcha. `lib/authFailureAlert.ts` fires `auth.sign_in_failure_burst` once per key per window, and `auth.rate_limited` on a GoTrue 429. A failed sign-in never changes what the user sees.
- **The alert channel is email.** The Sentry rule on tag `security:true` is a dashboard action, checklist item 8.
- **No WAF.** Vercel Firewall rate-limit rules are not available on this plan. Accepted as a residual gap, not deferred.
- **The four GitHub toggles stay open.** The board did not answer that question, so nothing was declined. Checklist items 1, 2, 5 and 6 read enabled from the provider anyway; what is outstanding is the board's own confirmation, not the setting.

### Channels that do not exist

Know these gaps before relying on the table above.

- **Burst detection is per instance.** The window in `lib/authFailureAlert.ts` lives in module scope on one serverless instance, so a slow distributed run spread across instances stays under every threshold and never fires. No control in the repo sees the real visitor IP across instances, and with no WAF on this plan none can.
- **Nothing is capped.** Detection is not throttling. A scraper on `/search` or a credential-stuffing run is counted, at best, and never slowed.
- **No audit-log review.** Nothing reads the Supabase or Vercel logs on a schedule.
- **Nobody is paged.** Every channel above is an email or a dashboard badge, read on a hobby schedule. Check the Actions tab and the Sentry inbox monthly regardless of whether anything arrived.

---

## 3. Dashboard checklist

Every line here is a toggle in somebody's dashboard. No PR can set one, and nothing in CI checks them. `[x]` is what the provider reported on 2026-11-25; re-read before trusting it.

Items 1, 2, 5 and 6 are the four the board was asked about on 2026-11-23, on the then-current claim that all four were off. All four read enabled. The question was left unanswered rather than declined, so the board's sign-off on them is still open.

### GitHub — repository → Settings → Advanced Security (older UI: Code security and analysis)

- [x] **1. Dependabot alerts.** Off: a CVE published against the deployed lockfile never surfaces. Fires → 4.2. Zero open today; all 34 ever raised are fixed.
- [x] **2. Dependabot security updates.** Off: alerts still arrive, but no fix PR is ever opened. `.github/dependabot.yml` only covers the weekly version bumps.
- [x] **3. Secret scanning.** Off: a committed credential stays live and unflagged in a public history. Fires → 4.1.
- [x] **4. Secret scanning push protection.** Off: the key reaches the public history before anyone reads an alert. Items 1 to 4 are free on a public repository.
- [x] **5. Private vulnerability reporting.** Same page, near the bottom. Off: the report link in `SECURITY.md` 404s and the reporter falls back to a public issue. Fires → 4.3.
- [x] **6. Branch ruleset on `main`.** Settings → Rules → Rulesets → `midnightframe`, id `27576655`, enforcement active, targeting `~DEFAULT_BRANCH`. It requires a pull request with one approval, `checks` and `test` green, and blocks deletion and non-fast-forward. Off: a regression test can be bypassed by pushing straight to `main`. Classic branch protection is absent, which is why `repos/.../branches/main/protection` answers 404 — that endpoint is not evidence here.
- [ ] **6a. Add `codeql` and `audit` to the ruleset's required checks.** Neither is a required context today, so a critical CodeQL finding is a badge and nothing stops a merge. `npm audit` reports clean as of 2026-11-25, so the `continue-on-error` that blocked this is now droppable. See recommendation 2.
- [ ] **7. Two-factor auth on GitHub, Vercel and Supabase.** Each provider's account settings. Off: one password stands between an attacker and the data, and on the Free plan Supabase holds the only live copy.

### Sentry — org `ewierzbicka`, project `midnightframe`

- [ ] **8. Issue alert rule on the `security` tag.** Alerts → Create Alert → Issues, trigger "a new issue is created", `IF` filter on tag `security` equals `true` (set by `lib/captureSecurityEvent.ts`). Email action; the board picked email on 2026-11-25.

  **The project's default rule already covers the first occurrence.** Sentry creates one issue alert per new project, and [`default_rules`](https://docs.sentry.io/api/projects/create-a-new-project/) is documented as "alert the user on every new issue". Event level is an [`IF` filter, not a trigger](https://docs.sentry.io/product/alerts/create-alerts/issue-alert-config/), and the default rule sets none, so a `warning` `captureMessage` is not filtered out. What the default rule does **not** do is re-alert: a repeat of the same event name groups into the existing issue, and that fires nothing. So an explicit rule is what turns a second burst into a second email. Verified against the Sentry docs on 2026-11-25.

- [ ] **9. Confirm the email action resolves to a mailbox you read.** The rule's action, plus the member notification settings it obeys. Off: the rule fires into nothing, which looks exactly like no attack.
- [ ] **10. Confirm the CSP endpoint is receiving.** Open the project's issues and look for CSP reports. A wrong `sentry_key` fails silently and the browser never retries; the URL is built once in `lib/sentryDsn.ts`. Fires → 4.8.

### Vercel — project settings

- **11. Firewall rate-limit rule. Not available on this plan**, confirmed by the board on 2026-11-25. Not a checkbox, so it carries none. It is the only control that would see the real visitor IP across instances, which is why its absence is listed as a residual gap in section 2 rather than as work.
- [x] **12. `CRON_SECRET` set in Production.** Off: Vercel sends no `Authorization` header, the keep-alive handler 401s every run, and the Supabase project pauses silently after about a week.
- [x] **13. `RESEND_WEBHOOK_SECRET` set in Production.** Off: the inbound email handler 500s on every delivery. It fails closed on purpose, so a missing secret is downtime rather than unverified mail.

### Supabase — project settings

- [ ] **14. Leaked-password protection.** Authentication → Sign In / Providers → Password. Off: a user can pick a password that is already in a public breach list. The toggle names its plan requirement if it has one.

Ticked 12 and 13 because the app would be visibly broken otherwise, not from reading the dashboard. Verify them there.

### Not toggles, so they live in review instead

- `SUPABASE_SECRET_KEY`, `TMDB_TOKEN`, `RESEND_API_KEY` and `RESEND_WEBHOOK_SECRET` are server-only. Only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL` may carry that prefix.
- RLS on every table, including new ones. A migration that creates a table without a policy is an access-control bug, and `e2e/rls.spec.ts` is where the proof goes. `deleted_accounts` stays service-role-only with deny-all.
- The `avatar` bucket stays private, read and write scoped to `{user_id}/`.
- Email confirmation stays on for password signups, and the Google OAuth redirect URLs stay limited to the live domain and localhost.
- HTTPS only. `Strict-Transport-Security` carries a two-year `max-age` with `preload`, so a downgrade to plain HTTP is not recoverable for existing visitors.

Secrets used by CI, all four required by the backup workflow: `SUPABASE_DB_URL`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_BACKUP_AGE_KEY`. Playwright needs `TMDB_TOKEN` and the `NEXT_PUBLIC_SITE_URL` repository variable. Never add a secret the unit suite would need: `checks.yml` runs with none, and that is deliberate.

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
5. **Nothing here is a gate.** Snyk, `npm audit` and Dependabot all report; none is a required check in the `midnightframe` ruleset, and `audit` carries `continue-on-error`. A red Snyk status is the only one that is even visible on the PR. Fix it in the same branch anyway, and do not merge past it on the grounds that the finding is old.

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
3. Nothing in a Sentry payload should contain user data. If it does, that is itself an incident: check `dataCollection` in all three init files, `src/instrumentation-client.ts`, `sentry.server.config.ts` and `sentry.edge.config.ts`.
4. A `warning` with tag `security:true` is a rejected request, not a crash. It is 4.7, and it does not belong in the error backlog.
5. CSP violations arrive as reports on the Sentry security endpoint, not as errors. A spike after a dependency change means a new third-party origin was added without updating `next.config.ts` — that is 4.8.

### 4.6 Suspected cross-account access

1. Run the access-control suite first: `npx playwright test e2e/rls.spec.ts`. It asserts that another user cannot read, write or delete someone else's rows or avatar objects.
2. Failing: the policy is the bug. Fix the migration, not the query. A client-side filter is not a fix.
3. Passing but the report stands: the leak is above the database. Check whether the route is in the known-route list in `proxy.ts`, and whether the handler uses the admin client where it should use the server client.
4. Either way, assume the data was read. Section 4.1 step 6 applies.

### 4.7 `SecurityEvent` in Sentry

1. Read `security_event` on the event. It names the branch that fired: a cron secret, a webhook signature, an auth callback, a login burst, or a GoTrue 429.
2. One or two is noise: a stale bookmark, a retried email link, a scanner. A run of them against the same route is not.
3. Cron events: check that `CRON_SECRET` in Vercel Production matches what the handler expects. A rotation applied in only one place looks identical to an attack.
4. Webhook events: confirm the signing secret in Resend matches `RESEND_WEBHOOK_SECRET`. Forged deliveries and a mismatched secret both land here.
5. `auth.sign_in_failure_burst`: ten failed sign-ins from one `x-forwarded-for` hop inside ten minutes. It fires once per key per window, so one event is already a burst, and **absence is not evidence** — see the per-instance gap in section 2. There is no block to lift and nothing to unlock; the decision is alert-only.
6. `auth.rate_limited`: GoTrue answered 429. Every visitor shares the Vercel egress IP, so this is usually capacity, not an attack. The numbers are in the `AGENTS.md` auth block. Never lower a limit in response to one of these.
7. The payload carries a name and nothing else, by design. Do not add bodies, tokens, emails or IPs to make triage easier.

### 4.8 CSP report in Sentry

1. Read the blocked URI. A first-party path means the policy is wrong; a third-party origin means something new was added without updating `next.config.ts`.
2. Legitimate origin: add it to the right directive in the same PR as the dependency, and add a case to `securityHeaders.test.ts`.
3. Injected or unexpected origin: that is an incident, not a config gap. Treat it as 4.1 and look at what shipped last.
4. A flood from one browser extension is noise. Extensions are the usual source of `report-uri` volume.

### 4.9 CodeQL finding in our own code

Not 4.2: that one is written for a dependency CVE and does not fit a pattern in this repository's source.

1. Read the data-flow path on the alert, not just the rule name. CodeQL names a source and a sink; the question is whether the source is actually attacker-controlled.
2. Reachable: fix the sink in a branch, with a unit test next to it. The two open alerts today are both `js/request-forgery` at critical, `src/services/getMedia.ts` and `src/app/api/email/inbound/route.ts`, where a URL is built from request input.
3. Not reachable: dismiss with "used in tests" or "false positive" and a reason. Never dismiss as "won't fix" without one.
4. No alert blocks a merge today. Checklist item 6a is what would change that.

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

What is left after the checklist, in order:

1. **Clear the two open CodeQL alerts.** Both `js/request-forgery` at critical. Section 4.9 is the per-alert decision. They are the only open findings against this code.
2. **Drop `continue-on-error` from the `npm audit` step, then add `codeql` and `audit` to the ruleset.** `npm audit` reports clean as of 2026-11-25, so the condition the step was waiting on is met. Until both land, a critical finding blocks nothing. Checklist item 6a.
3. **Finish checklist items 7 to 10.** Two-factor auth, the Sentry rule, its email action, and the CSP receipt check. Nothing there needs a PR.
4. **Go to Supabase Pro when the user base is real.** Managed daily backups, and it is also where the paid auth protections live. See [`BACKUPS.md`](BACKUPS.md) section 8.
5. **Revisit audit-log review** if there is ever a second maintainer. One person reading dashboards monthly is the current control, and it does not scale to an incident.

Not on this list, by decision: a WAF, a soft block on failed logins, and a lower Supabase auth rate limit. See the board decisions in section 2.
