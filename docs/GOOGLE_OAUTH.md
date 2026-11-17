# Google OAuth setup

Every piece of Google Cloud and Supabase config the Google sign-in flow depends on, with exact values.

Written after CIN-289, a `redirect_uri_mismatch` caused by none of this being recorded anywhere.

No secrets here. `<project-ref>` and `<prod-domain>` stay placeholders — never paste a real project ref, client id or client secret into this file.

---

## 1. Flow trace

`signInWithGoogle` (`src/services/auth.ts`) runs on the **server** client and calls:

```ts
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${NEXT_PUBLIC_SITE_URL}/api/auth/oauth-callback` },
});
```

What happens to that URL:

1. `redirectTo` becomes Supabase's `redirect_to` query param on `/auth/v1/authorize`.
2. Supabase redirects the browser to Google, with `redirect_uri` set to **its own** callback: `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Google sends the user back to Supabase's callback. Supabase exchanges the Google code, then redirects to the stored `redirect_to` with a PKCE `code`.
4. `/api/auth/oauth-callback` (`src/app/api/auth/oauth-callback/route.ts`) exchanges that code for a session and redirects to the sanitised `rurl`, or `/`.

**The `redirect_uri` Google validates is always Supabase's callback, never our app route.** This is the thing that gets confused. `/api/auth/oauth-callback` must never be added to the Google client, and the Supabase callback must never be added to the Supabase redirect allow list.

The server client is required in step 1 because it writes the PKCE code-verifier cookie where the route handler in step 4 can read it.

---

## 2. Google Cloud console — Authorized redirect URIs

On the OAuth 2.0 Client ID (APIs & Services → Credentials), both of these must be listed:

| URI                                                  | Covers         |
| ---------------------------------------------------- | -------------- |
| `https://<project-ref>.supabase.co/auth/v1/callback` | hosted project |
| `http://127.0.0.1:54321/auth/v1/callback`            | local stack    |

Both are needed because `NEXT_PUBLIC_SUPABASE_URL` differs per env file, and the file that wins decides which Supabase instance Google is handed:

- `.env.local` points at the hosted project. Next loads it for `next dev`, so ordinary local development goes through the **hosted** Supabase callback.
- `.env.test.local` points at `http://127.0.0.1:54321`. `e2e/env.ts` loads it ahead of `.env.local`, and its guard refuses to run the suite against anything non-local.

So a single checkout hits both callbacks depending on what you run. Register one and the other fails with `redirect_uri_mismatch`.

Use `127.0.0.1`, not `localhost`, for the local entry. That is the host the Supabase CLI serves on, and Google matches the string exactly.

---

## 3. Authorized JavaScript origins are not required

Leave that list empty. This is the server-side authorization-code flow: the browser only ever follows redirects, and the token exchange happens between Supabase and Google's token endpoint. Nothing in the app calls Google from JavaScript, so there is no origin for Google to validate. Do not add entries here to "be safe" — they are noise, and their absence is not the cause of any error in section 6.

---

## 4. Supabase dashboard — Authentication → URL Configuration

The redirect allow list must contain the **app** callback for each environment:

- `http://localhost:3001/api/auth/oauth-callback` — local dev (`NEXT_PUBLIC_SITE_URL` is port 3001)
- `https://<prod-domain>/api/auth/oauth-callback` — production

Without the entry, Supabase silently drops `redirect_to` after a **successful** Google round trip and lands the user on Site URL instead. The symptom is a user who is signed in but sitting on `/`, with no error anywhere.

Site URL should be the production origin.

For the local stack this list is not in the dashboard — it is `site_url` plus `additional_redirect_urls` under `[auth]` in `supabase/config.toml`. Today those are `http://127.0.0.1:3000` and `https://127.0.0.1:3000`, neither of which matches `http://localhost:3001/api/auth/oauth-callback`. Signing in with Google against the local stack therefore needs `http://localhost:3001/**` added to `additional_redirect_urls` first.

---

## 5. Supabase dashboard — Authentication → Providers → Google

- Enabled.
- Client ID and Client Secret are the **same credentials** as the local `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`. One Google client serves both environments, which is why section 2 lists two redirect URIs on it.
- Leave "Skip nonce check" off. `skip_nonce_check = true` in `supabase/config.toml` is local-only; it exists because local sign-in needs it, and it must not be mirrored to a hosted project.

---

## 6. Environment variables

| Variable                                  | Where it lives                                         | What reads it                                                                                                                                         |
| ----------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                    | Vercel project, per environment; `.env.local` locally  | `signInWithGoogle` builds `redirectTo` from it. Must be the real origin. Unset → the action returns a misconfiguration error and sign-in never starts |
| `NEXT_PUBLIC_SUPABASE_URL`                | `.env.local` (hosted), `.env.test.local` (local stack) | The Supabase client. Decides which `/auth/v1/callback` Google is asked to validate                                                                    |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` | local only, `.env.local`                               | `supabase start`, via `env()` substitution in `supabase/config.toml`. Unset → `supabase start` fails                                                  |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`    | local only, `.env.local`                               | Same                                                                                                                                                  |

The two `SUPABASE_AUTH_EXTERNAL_GOOGLE_*` vars configure the **local** stack only. A hosted project reads its credentials from the dashboard in section 5, not from the environment.

---

## 7. Symptoms

| Symptom                                                        | Cause                                                                                                                                                                                                                                  |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google 400, `redirect_uri_mismatch`                            | The Supabase `/auth/v1/callback` for the instance in use is missing from the Google client. Section 2                                                                                                                                  |
| Signed in, but landed on `/` instead of `rurl`                 | The app callback is missing from the Supabase redirect allow list, so `redirect_to` was dropped. Section 4                                                                                                                             |
| `/login?error=oauth_failed`                                    | The code exchange in `/api/auth/oauth-callback` failed, or no `code` arrived. Usually the PKCE code-verifier cookie is missing or expired — the sign-in started in a different browser, or the cookie was cleared between the two hops |
| `supabase start` fails on the `[auth.external.google]` section | `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` or `_SECRET` is unset. Section 6                                                                                                                                                             |
| "Server misconfiguration: NEXT_PUBLIC_SITE_URL is not set."    | `NEXT_PUBLIC_SITE_URL` missing in that environment. Section 6                                                                                                                                                                          |
| Google consent screen rejects the account                      | The OAuth client is in testing mode and the account is not a listed test user. Google Cloud → OAuth consent screen                                                                                                                     |

---

## 8. Checklist for a new environment

1. Add `https://<project-ref>.supabase.co/auth/v1/callback` to the Google client's redirect URIs.
2. Enable the Google provider on the Supabase project with that client's id and secret.
3. Add `https://<new-domain>/api/auth/oauth-callback` to the Supabase redirect allow list.
4. Set `NEXT_PUBLIC_SITE_URL` to `https://<new-domain>` in that Vercel environment.
5. Sign in, and confirm the landing path is the `rurl`, not `/`.
