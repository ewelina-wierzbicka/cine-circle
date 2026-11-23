# MidnightFrame

A web app for tracking and sharing watched movies with friends.

**Stack:** Next.js 16 (App Router) · React · TypeScript · Supabase

---

## Core Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (localhost:3000)
npm run build        # production build
npm run start        # start production server
npm run lint         # run ESLint
npm run lint:fix     # auto-fix lint issues
npm run format       # run Prettier across all files
npm run type-check   # tsc --noEmit
npm run test         # run the Vitest unit suite once
npm run test:watch   # Vitest in watch mode
```

Fix all ESLint errors before committing — warnings are acceptable, errors are not. Do not use `// eslint-disable` without a comment explaining why.

**Hooks (run automatically):**

- **pre-commit** — lint-staged runs ESLint + Prettier on staged `.ts`/`.tsx` files
- **pre-push** — `type-check` then `test` run on the full project

**CI:** `.github/workflows/checks.yml` runs lint, type-check and the unit suite on every PR and push to `main`. No Supabase, browsers or secrets. Playwright runs separately in `playwright.yml`.

**Security CI:** `.github/workflows/security.yml` runs `npm audit --audit-level=high` and CodeQL (`javascript-typescript`) on PRs, pushes to `main` and weekly. The audit step is `continue-on-error` until the current transitive dev-tooling advisories clear. `.github/dependabot.yml` opens weekly npm and github-actions PRs, minor and patch grouped, majors separate.

---

## Code Style

ESLint + Prettier are configured — follow them strictly. Do not disable rules inline unless absolutely necessary, and leave a comment explaining why.

- TypeScript strict mode — no `any`, no `// @ts-ignore` without justification
- Named exports preferred over default exports (exception: Next.js page/layout files)
- Use `const` by default; `let` only when reassignment is needed
- Prefer `async/await` over `.then()` chains

---

## Project Structure

```
src/
  app/
    (auth)/                   # auth routes — login, register, confirm-email
      AuthFormLayout.tsx      # shared layout for auth forms
      AuthFormFooter.tsx      # shared closing line under an auth form
      AuthFormHeading.tsx     # icon chip + title + subtitle block every auth screen opens with
      InboxNotice.tsx         # "we emailed you" body + spam-folder tip card
      GoogleSignInButton.tsx  # client — outlined Button calling signInWithGoogle; login passes rurl
      AuthDivider.tsx         # "or" rule between the Google button and the email form
      layout.tsx
      login/
        page.tsx
        LoginForm.tsx
        error.tsx              # error boundary for /login — auth failure UI
      register/
        page.tsx
        RegisterForm.tsx
        error.tsx              # error boundary for /register — registration failure UI
      confirm-email/
        page.tsx
      forgot-password/         # /forgot-password — request a reset link
        page.tsx
        ForgotPasswordForm.tsx
        error.tsx              # error boundary for /forgot-password — request failure UI
      reset-password/          # /reset-password — set a new password (reached via email link → reset-callback)
        page.tsx
        ResetPasswordForm.tsx
        error.tsx              # error boundary for /reset-password — reset failure UI
      registration-confirmed/  # /registration-confirmed — email confirmation success page (auth route; reached via confirm-callback without a session, logged-in users redirected to /)
        page.tsx
        SignInButton.tsx       # client — Button-styled CTA, router.push('/login')
    (app)/                # private and public routes (single layout, no sub-groups)
      page.tsx                # / (home page)
      HomeHero.tsx            # home hero — h1, SearchBox, dropdown-shift flag
      HomeAbout.tsx           # signed-out about section — FAQ accordion (from lib/homeFaq.ts) + feature cards
      SignedOutAbout.tsx      # gate that renders HomeAbout for signed-out visitors only
      RecentWatched.tsx       # "Recently Watched" strip, streams via Suspense
      search/                 # /search
        page.tsx
        loading.tsx           # streams SearchBox + results grid skeleton
        SearchResults.tsx
      movie/[id]/             # /movie/:id
        page.tsx
        loading.tsx           # streams <MediaDetailSkeleton /> via Suspense
      collection/               # /collection
        page.tsx
        loading.tsx           # streams MyMedia header + grid skeleton
        MyMedia.tsx            # tabs + filters: title, media type, rating multi-select (watched tab only)
        UserMediaList.tsx
      profile/                # /profile
        page.tsx
        loading.tsx           # streams profile skeleton via Suspense (PPR — uncached Supabase data)
        ProfileContent.tsx
        ProfileSkeleton.tsx
        SettingsRow.tsx        # collapsible account row (email, password, delete)
      series/[id]/            # /series/:id
        page.tsx
        loading.tsx           # streams <MediaDetailSkeleton /> via Suspense
      about/                  # /about — static About page (open route, indexable)
        page.tsx              # copy only; renders <StaticContentPage />
      terms/                  # /terms — static Terms and Conditions page (open route)
        page.tsx              # copy only; renders <StaticContentPage />
      privacy/                # /privacy — static Privacy Policy page (open route)
        page.tsx              # copy only; renders <StaticContentPage />
      error.tsx               # (app) error boundary (client) — catches runtime errors in (app) routes
      not-found.tsx           # (app) 404 — wrapper around <NotFoundState />, renders for notFound() calls inside (app)
      layout.tsx
    api/                      # Route Handlers
      auth/
        confirm-callback/
          route.ts            # GET — redirect-only: Supabase's confirmation link verifies the email, then lands here with a code; code present → /registration-confirmed (no session ever created), no code → /login?error=confirm_failed
        reset-callback/
          route.ts            # GET — exchanges email-link code for session, redirects to /reset-password or /login?error=reset_failed
        oauth-callback/
          route.ts            # GET — exchanges the Google PKCE code for a session, redirects to the sanitised `rurl` or `/`; no code or exchange failure → /login?error=oauth_failed
      cron/
        keep-alive/
          route.ts            # GET — daily Vercel cron ping; requires `Bearer $CRON_SECRET`, runs one head-only `profiles` count so the Supabase free project never pauses
      email/
        inbound/
          route.ts            # POST — Resend inbound email webhook; verifies svix signature (RESEND_WEBHOOK_SECRET), logs received emails. Fails closed: a missing or empty secret 500s before any parse or Resend call, so it can never relay unverified mail. `email_id` must match the Resend UUID shape or the payload 400s before the content fetch, and `from`, `to` and `subject` are escaped before they reach the notification HTML
    layout.tsx                # root layout
    not-found.tsx             # root 404 — same <NotFoundState />, full-screen wrapper; renders for URLs that match no route at all
    sitemap.ts                # /sitemap.xml — open routes + trending and popular media (~86 URLs)
    robots.txt/
      route.ts                # GET /robots.txt — crawler rules, Content-Signal, sitemap pointer
    llms.txt/
      route.ts                # GET /llms.txt — plain-text site map for language models; open routes only
    llms-full.txt/
      route.ts                # GET /llms-full.txt — full text of the open pages, built from lib/staticPages.ts and lib/homeFaq.ts
    manifest.ts               # /manifest.webmanifest — web app manifest; makes the site installable, no service worker
    opengraph-image.png       # site-wide default OG image, static 1200x630 PNG
    opengraph-image.alt.txt   # alt text for it — becomes og:image:alt / twitter:image:alt
  globals.css
  providers.tsx               # app-wide React context providers
  proxy.ts                    # Next.js 16 middleware (formerly middleware.ts) — matcher excludes sitemap.xml, robots.txt, llms.txt, llms-full.txt and manifest.webmanifest; also resolves movie/series ids so unknown ones answer a real 404 and mis-slugged ones a real 308
  types.ts                    # app-wide TypeScript types (NormalizedMedia, SavedMedia, RecommendedMedia, etc.)
  components/                 # shared components (SearchBox, Header, Footer, MediaInfoHeader, AuthErrorState, StaticContentPage, etc.)
  hooks/                      # custom React hooks
  icons/                      # icon components
  lib/                        # utilities, helpers, constants
    staticPages.ts            # ABOUT_PAGE, TERMS_PAGE, PRIVACY_PAGE copy; the three pages render from it
  services/                   # data fetching / API service functions
```

- Auth is handled in `proxy.ts` (middleware) — unauthenticated users are redirected to `/login` before any page renders. Do not add auth checks in individual pages or layouts.
- `proxy.ts` is the Next.js 16 middleware file (replaces `middleware.ts`). Its matcher excludes `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `manifest.webmanifest` and `opengraph-image` — metadata routes must never be redirected to `/login`, or crawlers cannot fetch them and the install prompt never appears
- `AUTH_ROUTES` (`/login`, `/register`, `/confirm-email`, `/forgot-password`, `/registration-confirmed`) — logged-in users are redirected away from these to `/`
- `/reset-password` is not in `AUTH_ROUTES` — it is reached only after the reset-callback exchanges the email-link code for a valid session, so it expects an authenticated user. It receives `error=reset_failed` on the login page (via the `/login?error=reset_failed` redirect) when the callback fails; `LoginForm` surfaces that as a toast.
- `/registration-confirmed` is an auth route in `AUTH_ROUTES` — Supabase's confirmation link verifies the email at click time, and the confirm-callback redirects there without ever creating a session, so the visitor is logged out; logged-in users hitting it are redirected to `/`. On callback failure, the user lands on `/login?error=confirm_failed`; `LoginForm` surfaces that as a toast.
- `KNOWN_ROUTES_EXACT` / `KNOWN_ROUTE_PREFIXES` list every page route the app serves. A path matching neither is passed through untouched with `NextResponse.next()`, so Next.js answers it: the root 404 for a URL that matches no route. That is the point — unknown URLs like `/nonexistent-xyz` must answer 404, not redirect to `/login`. The proxy itself never returns a 404 for an unlisted path
- **A new page route must end up in the known-route list, or it renders for everyone with no auth gate.** It does not 404: the page exists, so the pass-through serves it, skipping both the `/login` redirect and the session cookie refresh. Leaving a private route off the list makes it public. This check runs first, before the open/auth/private logic. `KNOWN_ROUTES_EXACT` spreads in `AUTH_ROUTES` and `OPEN_ROUTES_EXACT`, so where you add the route decides whether registration is automatic:
  - auth route → `AUTH_ROUTES`. Registered automatically
  - open exact route → `OPEN_ROUTES_EXACT`. Registered automatically
  - open prefix route → `OPEN_ROUTE_PREFIXES` **and** `KNOWN_ROUTE_PREFIXES`. Open prefixes are not spread in, which is why `/search` is also listed explicitly in `KNOWN_ROUTES_EXACT`
  - private route → `KNOWN_ROUTES_EXACT`. Private is the default for known routes
  - session-gated but neither auth nor open, like `/reset-password` → `KNOWN_ROUTES_EXACT` explicitly
- Open routes (no redirect for unauthenticated users): exact match `/`, `/about`, `/terms`, `/privacy`, plus prefixes `/search`, `/movie/`, `/series/`
- **`proxy.ts` resolves the movie/series id before the response starts.** `/movie/[id]` is a PPR route, so the prerendered shell flushes a 200 and `notFound()` or `permanentRedirect()` in `MediaPage` can only swap the body. A non-numeric slug is rejected with no network call; a numeric one costs one `resolveMedia()` lookup (`services/resolveMedia.ts`, plain fetch, no `next/cache`). Unknown ids are rewritten to `/_not-found`, which answers a real 404 with the root not-found UI. Measured on next 16.4.6, `next build && next start`: `/movie/999999999`, `/movie/abc` and `/series/999999999` all answer `404`, `/movie/550` a `308` to `/movie/550-fight-club` which then answers `200`. A resolved id whose slug is not `toHref(id, title, mediaType)` gets a real 308 to that path, `request.nextUrl.search` appended.
  - The lookup runs in `Promise.all` with `supabase.auth.getUser()`, so it adds no latency on top of the session check.
  - It is skipped when the request carries an `rsc` header. In-app navigation never reaches a crawler and still renders the not-found UI via `notFound()` and redirects via `permanentRedirect()`.
  - `resolveMedia` returns the title from the same response as the status — **never add a second fetch for it**. Series read `name`, movies read `title`.
  - It fails open on a missing `TMDB_TOKEN` or a TMDB error: `exists: true` with a null id and title, so the request passes through unredirected. A soft 404 beats 404ing a real page, and a guessed slug would be a wrong 308.
  - Both the 404 rewrite and the 308 carry the Supabase cookies off `supabaseResponse` via `withSessionCookies`, or a refreshed session token is dropped.
  - The 404 rewrite also sets `X-Robots-Tag: noindex`, and both `not-found.tsx` files export `NOT_FOUND_METADATA` from `lib/seo.ts`, so the body carries `noindex, nofollow` too. Next adds its own `noindex` meta on top. Never drop either half: the header does not depend on what Next does with the status, the metadata covers the root 404 for an unlisted path, which the proxy passes through untouched.
  - `toHref` drops the trailing dash when a title slugifies to nothing, so `/movie/123` is its own canonical and the 308 cannot loop.
  - `MediaPage` keeps its own `notFound()` and `permanentRedirect()` calls. They cover RSC navigation and are the reason the body is correct today.
- All other known routes require auth — unauthenticated users are redirected to `/login?rurl=<pathname>`
- `signInWithGoogle` (`services/auth.ts`) starts the Google PKCE flow on the **server** client, so the code-verifier cookie is written where `/api/auth/oauth-callback` can read it. Every `rurl` goes through `lib/safeRedirectPath.ts` first — same-site paths only, `//host` and `/\host` rejected.
- Keep data fetching logic in `services/` — don't inline fetch calls in components
- **`vercel.json` (repo root) holds the cron schedule.** One entry: `/api/cron/keep-alive` daily at `0 6 * * *`. Vercel Hobby caps cron at one invocation per day, and daily leaves headroom for a missed run inside Supabase's 7-day pause window. `CRON_SECRET` must be set in the Vercel project (Production), or Vercel sends no `Authorization` header, the handler 401s every run, and the project pauses silently. The ping is an ops call, not app data, so the query stays inline in the handler rather than in `services/`. No `proxy.ts` change: the matcher already excludes `api/`
- Search cards know saved status: `hooks/useSavedMediaStatus.ts` loads the user's `user_media` once (key `['user-movies','saved-status']`), `SearchResults` merges it in. Overlays match the collection page.
- Collection card links carry `?tab=<to_watch|watched>`, so `CollectionBackLink` sends the user back to the tab they came from. `useDetailStep` preserves every other query param when it switches step, which is what keeps that tab alive through the entry form.

---

## Styling

Tailwind CSS v4 with custom design tokens defined in `src/globals.css`. Always use these — never hardcode hex values.

**Fonts:**

- `font-sans` — DM Sans (weights 300/400/500/600). **The inherited default**, from the `font-sans` class on `<body>` in `app/layout.tsx`. Do not write it at a call site: it is a no-op unless an ancestor sets `font-serif` or `font-mono`. The class on `<body>` must stay — the `next/font` `--font-dm-sans` variable is scoped there, so Tailwind's preflight rule on `html` cannot resolve it.
- `font-serif` — DM Serif Display (headings, display text)
- `font-mono` — DM Mono (labels, nav items, monospaced text)

**Design tokens:**

```ts
export const colors = {
  // Page backgrounds — layered dark surfaces
  bg: '#0d0d10', // maps to CSS var --color-dark
  bg2: '#18181f', // maps to CSS var --color-bg2
  bg3: '#21212a', // maps to CSS var --color-bg3

  // Text
  text: '#ece9e3', // maps to CSS var --color-primary
  muted: 'rgba(236,233,227,0.75)', // maps to CSS var --color-secondary

  // Accent — pastel accent
  accent: 'oklch(80% 0.25 285)', // maps to CSS var --color-accent
};
```

> Star ratings use Tailwind's built-in `text-amber-400` — not a custom token.

**Gradient utility (defined in `globals.css`):**

- `--gradient-blue`: `linear-gradient(160deg, #1A3A5CED 0%, #1a3a5c66 45%, #0d0d10 100%)`
- `bg-gradient-blue` — applies `--gradient-blue` as background-image via `@utility`

**Animation utilities (defined in `globals.css`):**

- `animate-fade-up` — opacity 0→1 + translateY 18px→0, 500ms spring
- `animate-fade-in` — opacity 0→1, 400ms ease

**Body copy line-height:**

- `body` sets `line-height: 1.625` and `@theme inline` pins `--text-sm--line-height` and `--text-base--line-height` to the same. **Both are needed:** the `body` rule alone only reaches text with no `text-*` class.
- So **never write `leading-relaxed`** — `text-sm` and `text-base` already are 1.625, and a `leading-*` override still wins.
- Sizes above `text-base` keep the Tailwind defaults, so a heading needs its own `leading-*`.

**Typography utilities (defined in `globals.css`):**

| Utility         | Sets                                                                |
| --------------- | ------------------------------------------------------------------- |
| `label-mono`    | mono + `text-sm` + `0.18em` + `uppercase`                           |
| `ui-mono`       | mono + `text-sm` + `0.05em`, no `text-transform`                    |
| `title-serif`   | serif + `text-6xl` + 400 + `-0.02em` + `1.1` leading                |
| `display-serif` | serif + `clamp(32px, 5vw, 48px)` + 400 + `-0.03em` + `0.95` leading |

- **Every mono call site uses a mono utility, every serif heading a serif utility.** Never write `font-mono text-sm tracking-[…]` or `font-serif … leading-[…]` again. Bare `font-serif` is for the rare non-heading glyph, where tracking would throw off centring.
- **Pick by role, not size.** `title-serif` is the auth and form heading, `display-serif` the page title. Both are size-overridable.
- Colour and margins stay at the call site. Add `uppercase` beside `ui-mono` for an all-caps chip.
- Do not pair a utility with what it already sets (`font-mono`, `font-serif`, `text-sm`, `uppercase`, `tracking-*`). Overrides still win, so `label-mono text-base` is a valid 16px label.
- **Keep `--tw-leading` beside `line-height` in the serif rules.** That is what makes the size overridable: `title-serif text-4xl` keeps 1.1. `font-normal` is redundant; DM Serif Display ships no other weight.
- **`font-family` must come from the `next/font` variable (`--font-dm-serif-display`, `--font-dm-mono`), never the `--font-serif` / `--font-mono` theme key.** The key resolves to nothing at `:root`, so the font silently falls back to DM Sans. Same body-scoping caveat as the `font-sans` note above.
- **No fifth utility.** Body copy is a bare `text-sm` or `text-base`: 1.625 is already pinned, DM Sans is inherited, and colour belongs at the call site.
- **No arbitrary px font size for body copy** — `text-[14px]` emits a bare `font-size` and skips the 1.625 pin. The one exception is a display size on no Tailwind step, written on top of a serif utility, where overriding size without resetting leading is the point.

**Rules:**

- Mobile-first — use base styles for mobile, `sm:` / `md:` / `lg:` for larger screens
- Always use design tokens for colors used in more then one place and tailwind classes for other colors — never hardcode hex values like `#1e2122`
- Before adding a new color, check if an existing token fits
- For borders and overlays without a named token, use Tailwind opacity utilities: `border-white/[0.07]`, `bg-white/4`, etc.
- Check existing components in `components/` for patterns before building new UI
- `MenuOption` is the dropdown row for `Select`, `RatingMultiSelect` and the `Header` menu. It renders an `<li>` and ships only the look — pass the role, ARIA state and key handlers at the call site, since a listbox option and a menuitem need different ones
- `FieldLabel` is the mono label above a form field. It stays inline, so an added `mb-*` behaves as it did before it was a component
- Never use text smaller than `text-sm` — minimum font size is `text-sm` (14px)
- SVG icons must live in `src/icons/` as named-export components — never inline raw `<svg>` in component files

---

## Supabase

- Use the **server client** (`lib/supabase/server.ts`) in Server Components and Route Handlers
- Use the **browser client** (`lib/supabase/client.ts`) in Client Components only
- Use the **admin client** (`lib/supabase/admin.ts`) only for privileged server-side operations (e.g. `deleteUser`) — it bypasses RLS
- Never expose the service role key — it must only be used server-side
- Row Level Security (RLS) is enabled — always test that policies enforce access correctly
- Do not run raw SQL migrations manually; use Supabase migrations (`supabase/migrations/`)
- **Supabase CLI 3.x is required.** `supabase/config.toml` uses `[local_smtp]`, the section that replaced `[inbucket]` in v3. CLI 2.x rejects `local_smtp` and 3.x rejects `inbucket`, so the two cannot coexist — `supabase start` fails on the wrong major. Both workflows pin `supabase/setup-cli` to `3.0.0`; `version: latest` is what broke CI when v3 shipped. Upgrade locally with `brew upgrade supabase`.

### Schema

| Table              | Key columns                                                   | Notes                                                                                                                |
| ------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `profiles`         | `id`, `user_id` (FK→auth.users), `display_name`, `avatar_url` | Auto-created on first `getProfile` call                                                                              |
| `media`            | `id`, `tmdb_id`, `media_type`, `title`, `poster_path`         | Shared by every user. No app-user writes: `addUserMedia` upserts it via the admin client from the cached TMDB detail |
| `deleted_accounts` | `id`, `user_id` (unique, **no FK**), `deleted_at`             | Erasure log written by `deleteAccount` before `deleteUser`. Service role only, RLS deny-all                          |

`deleted_accounts` has no FK to `auth.users` on purpose — the row must outlive the account. It exists so a restore can re-apply deletions taken after the backup, which is what keeps backups "beyond use" under Art. 17. See `docs/BACKUPS.md` section 6.

On creation only, `getProfile` seeds `display_name` from `user_metadata.full_name ?? name` so an OAuth sign-in lands with a readable name. An existing row is never touched.

`[auth.external.google]` is enabled in `supabase/config.toml` and reads `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` from the environment. Both must be set, or `supabase start` fails. `skip_nonce_check = true` is required for local Google sign-in.

### Storage

| Bucket   | Public | Path pattern           | Notes                                                                                |
| -------- | ------ | ---------------------- | ------------------------------------------------------------------------------------ |
| `avatar` | ❌     | `{user_id}/{filename}` | Private. Read and write limited to own folder. Served via signed URLs, 1 hour expiry |

The `avatar` bucket is created by `supabase/migrations/20260917143659_add_avatar_bucket.sql`, so `supabase db reset` gives a fresh local stack a working bucket. Storage RLS policies for it live in the base `remote_schema` migration.

### Backups

`.github/workflows/backup.yml` runs a nightly age-encrypted dump (roles, schema, data, plus the `avatar` bucket via `scripts/backup-storage.mjs`) and uploads it as a 30-day artifact. Setup, restore steps, security and GDPR rationale: `docs/BACKUPS.md`.

- It fails until the four repo secrets exist. That is deliberate, not a bug.
- The cron is `17 19 * * *`, not the time it runs. GitHub fires this repo's schedule ~8h late, so the cron is the 03:00 UTC target minus that lag. See `docs/BACKUPS.md` section 2.
- Supabase platform backups never include Storage objects, on any plan, which is why the bucket is dumped separately.
- `supabase db dump` without `--data-only` omits the `auth` and `storage` schemas. All three dump commands are needed or user accounts are lost.
- Use the **session** pooler URL. The direct host is IPv6-only and GitHub runners cannot reach it.

---

## Next.js Conventions

- Default to **Server Components**; add `"use client"` only when needed (event handlers, hooks, browser APIs)
- Keep data fetching in Server Components or Route Handlers — avoid fetching in Client Components where possible
- Use Next.js `loading.tsx` and `error.tsx` files for async boundaries
- Environment variables: server-only vars in `.env.local`, public vars prefixed with `NEXT_PUBLIC_`
- Images use a global custom loader: `images.loader: 'custom'` + `images.loaderFile: './src/lib/imageLoader.ts'`. TMDB URLs are rewritten to the nearest TMDB width bucket (`w92`…`w780`, else `original`) and served straight from TMDB's CDN, which restores `srcset`. All other sources (Supabase avatars, local `/logo.webp`) are returned unchanged.
- Because `/_next/image` is unavailable, non-TMDB images must be pre-sized at the source: `public/logo.webp` ships at 400px wide (2x its 200px render) and avatars are downscaled to 128px WebP by `lib/resizeImage.ts` before upload. Any new local asset must be committed at roughly 2x its render size — do not add a full-resolution PNG to `public/`. The exception is `app/opengraph-image.png`: social crawlers want it at exactly 1200x630, and it never renders in the app.
- `images.imageSizes` is `[92, 154]` and `images.deviceSizes` is `[185, 342, 500, 780]` — the TMDB buckets. Do not widen them: the Next.js defaults emit candidates up to 3840, and any candidate above 780 resolves to TMDB `original` (multi-MB) for a poster rendered at 500px.
- Setting any non-default `images.loader` makes Next.js 404 the `/_next/image` optimizer route for every request. Do not write loader output that points at `/_next/image` — it is a dead link. `images.remotePatterns` is likewise inert while the custom loader is active, but the TMDB and Supabase entries are kept so the config stays correct if the loader is ever removed.
- Never pass a `loader` function prop to `next/image` from a Server Component — functions cannot cross the RSC boundary. Use `loaderFile` instead.
- **LCP images carry `priority`.** In Next 16 `priority` emits a `<link rel="preload" as="image">` and drops `loading="lazy"`; it does **not** set `fetchpriority`. That is the separate `fetchPriority` prop. Current `priority` call sites: the `/logo.webp` logo in `Header`, `HeaderSkeleton` and `AuthFormLayout`, all through `<Logo priority />`; the detail poster in `MediaDetailWrapper`; the auth poster grid in `AuthFormLayout`. `fetchPriority="high"` is reserved for the single largest image per page, and the only call site is the detail poster in `MediaDetailWrapper`.
- Build every TMDB image URL with `tmdbImageUrl(path)` from `lib/tmdbImage.ts`. Never hardcode `https://image.tmdb.org/t/p/<size>` at a call site. For social/OG images use `tmdbSocialImageUrl(path)` — crawlers fetch the raw URL with no loader in front of it, so it pins the `w780` bucket.

### Metadata & SEO

All SEO constants live in `src/lib/seo.ts`: `SITE_NAME`, `SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION`, `STATIC_PAGE_LAST_MODIFIED`, `absoluteUrl()`, `truncateDescription()`, `mediaMetadata()`, `NOT_FOUND_METADATA`. `sitemap.ts` and `robots.txt/route.ts` import `SITE_URL` from there — do not re-derive it from `process.env`.

- The root layout sets `metadataBase: new URL(SITE_URL)` and `title: { default: SITE_TITLE, template: '%s | MidnightFrame' }`. Per-page titles are the bare page name (`'Sign in'`, `'Your Profile'`); the template appends the brand. Use `title: { absolute: ... }` only on the home page.
- `NEXT_PUBLIC_SITE_URL` must be set in every deployed environment or `metadataBase` falls back to `http://localhost:3000`.
- Every indexable page sets `alternates.canonical`. Movie and series pages canonicalise to `absoluteUrl(toHref(id, title, mediaType))`, which collapses every mis-slugged `/movie/123-anything` variant onto one URL. `/search` canonicalises to `/search` with no query string.
- **A non-canonical slug answers a real 308 from `proxy.ts`**, to `toHref(id, title, mediaType)` with the query string preserved. It has to live there: `/movie/[id]` is a PPR route, so the prerendered shell flushes 200 before `permanentRedirect` in `MediaPage` resolves, and Next downgrades it to a `<meta http-equiv="refresh">` in the body. The proxy reuses the `resolveMedia()` lookup the 404 fix already pays for, which is the detail fetch and therefore carries the title. See the `proxy.ts` bullets under Project Structure. `MediaPage` keeps its `permanentRedirect` for RSC navigation.
- **Unknown movie and series ids answer a real 404**, resolved in `proxy.ts` before the response starts. Same PPR constraint as the redirect above. See the `proxy.ts` bullets under Project Structure.
- `generateMetadata` may await `params`, `searchParams` and `use cache` services. It must never read `cookies()`, `headers()` or Supabase — no per-user data in metadata.
- **`htmlLimitedBots` stays unset in `next.config.ts`. On next 16.4.6 the configured regex _replaces_ the built-in bot list instead of extending it, so setting it loses more crawlers than it gains.** Measured on 16.4.6, not read off the source: `htmlLimitedBots: /GPTBot|ClaudeBot/` flips those two from the 10 KB shell to the 77 KB blocking render and flips Bingbot the other way, 80109 → 10309 bytes, and `prerender-manifest.json` → `experimentalBypassFor` collapses from the full built-in UA regex to `.*(?:GPTBot|ClaudeBot).*`. That trades Bingbot, Twitterbot, LinkedInBot, Slackbot, Discordbot, facebookexternalhit and the Google crawlers for two UAs that already get every tag without it. Both readers take the config: `serveStreamingMetadata` and the Vercel CDN bypass. The separate 16.1.6 trap, where a configured bot got the tags in neither the head nor the body, is gone — `serveStreamingMetadata` is now `!userAgent ? true : shouldServeStreamingMetadata(ua, nextConfig.htmlLimitedBots)` (`next/dist/build/templates/app-page-runtime.js`) with no `isHtmlBot && isRoutePPREnabled ? false :` branch in front of it, and `shouldForceDynamicPPRRender = isRoutePPREnabled && !serveStreamingMetadata` bypasses the shell so blocking metadata lands in the initial head. Every UA gets the full head either way on 16.4.6, so the config buys nothing and costs the UAs it omits. Raw tables: CIN-357, and the same comment on PR #228.
- **`generateStaticParams` buys prerendered shells for the sitemap ids. It is not what puts the tags in the crawler-visible `<head>` on 16.4.6.** Measured against production `midnightframe.app` on next 16.4.6, 11 read-only GETs: ids **absent** from `generateStaticParams` serve `<title>`, description, canonical, `og:title` and `og:image` inside the real `<head>` for GPTBot, ClaudeBot, Googlebot, Bingbot, PerplexityBot and no UA, with zero metadata tags after `</head>` in any response. Listed and unlisted ids are indistinguishable in the head; only `x-vercel-cache` differs, PRERENDER vs MISS, and the MISS rows were cold renders. So what `services/getStaticMediaParams.ts` still buys is that the ~80 sitemap ids answer from a prerendered shell rather than a cold function invoke. Keep it for that — dropping it is a separate decision these measurements do not make.
  - Why the pre-16.4.6 empty-head claim no longer holds: `prerender-manifest.json` → `dynamicRoutes['/movie/[id]']` carries two new 16.4.6 fields, `response: "empty"` and `compute: "blocking"` (`hasPostponed && hasEmptyStaticShell ? 'blocking'`, `next/dist/build/index.js:191`), so the platform is told to invoke the function instead of serving the 0-byte fallback shell. The shell artifact is still 0 bytes on 16.4.6; it just never reaches a crawler. On 16.1.6 it did, which is what the old bullet described.
  - `dynamicParams` stays default: an unlisted id renders on demand and, on 16.4.6, with a full head. `getStaticMediaParams` swallows a TMDB failure and returns `[]`, so an outage costs prerendering, not the build.
  - The ids are the deduped trending and popular set from `getPopularMediaEntries()`, the same call `sitemap.ts` uses — every URL we advertise is a URL we prerendered. Keep the two on that one function.
  - The page body and JSON-LD still stream, because the pages await `searchParams`. Crawlers get them in the HTML either way. Dropping `searchParams` to pull them into the shell is a separate change.
- noindex list: `(auth)/layout.tsx` (covers every auth route), `/collection`, `/profile`, `/search?query=…`, and unresolvable movie/series slugs. **The `robots.txt` `disallow` list is deliberately different, not out of sync.** It disallows the auth-gated and private paths (`/api/`, the auth routes, `/profile`, `/collection`); `/search?query=…` and unresolvable media slugs are noindex only. A disallowed URL is never fetched, so its `noindex` is never read, and an external link can still get it indexed with no snippet and no way to drop it. Nothing links to a `/search?query=` URL, so there is no crawl-budget case for blocking it either.
- `sitemap.ts` lists the four open static routes plus trending and popular media, roughly 87 URLs. The media list is `getPopularMediaEntries()` from `services/getStaticMediaParams.ts`, deduped by `${mediaType}-${id}`. Only open routes belong there — never add a path that is in the `robots.txt` `disallow` list.
- Media URLs are built with `toHref(id, title, mediaType)`, the same call the pages canonicalise with, so no sitemap entry redirects.
- **`app/robots.txt/route.ts` serves `/robots.txt`**, a plain-text route handler, not the `robots.ts` metadata convention. `MetadataRoute.Robots` has no field for an extra directive, and the file needs one: `Content-Signal: search=yes, ai-input=yes, ai-train=no`, one `CONTENT_SIGNAL` const inside the `User-agent: *` group. Same handler shape and constraints as `llms.txt` below. The sitemap line comes from `SITE_URL`.
  - `src/test/robotsRules.ts` parses the served body for the `Disallow` lines, so `disallowRules()` and `isDisallowed()` are async. `sitemap.ts`, `llms.txt` and `llms-full.txt` cross-check against it.
- **`app/llms.txt/route.ts` serves `/llms.txt`**, a plain-text description of the site for language models (`text/plain; charset=utf-8`). The body is a module-level template string built from `SITE_NAME`, `SITE_URL`, `SITE_DESCRIPTION` and `absoluteUrl()` — never hardcode the domain.
  - Same rule as `sitemap.ts`: only open routes may be listed. Never name a path that is in the `robots.txt` `disallow` list. The `## Pages` list is `/`, `/about`, `/search`, `/terms`, `/privacy` — add a new open route here and in `sitemap.ts` together.
  - The handler reads no `cookies()`, `headers()` or Supabase, so it prerenders as static under Cache Components. Keep it that way — no `export const dynamic`.
  - It reaches anonymous crawlers because `llms.txt` is excluded from the `proxy.ts` matcher, not because it is in `KNOWN_ROUTES_EXACT`. Adding it there instead would make it a private route and redirect signed-out visitors to `/login`.
  - The "Media pages" section says streaming availability is resolved per visitor region, so a crawler sees one region's view only.
- **`app/llms-full.txt/route.ts` serves `/llms-full.txt`**, the llmstxt.org companion to `llms.txt`: the full text of the open pages in one plain-text file. Same handler shape and same constraints as `llms.txt` above, and it is linked from the `## Optional` block there.
  - **Never retype copy into it.** The sections come from `ABOUT_PAGE`, `TERMS_PAGE` and `PRIVACY_PAGE` in `lib/staticPages.ts`, the FAQ from `HOME_FAQ` in `lib/homeFaq.ts`, the same consts the pages render. The route only adds headings and `absoluteUrl()` source links.
  - `llms-full.txt` needs its own alternative in the `proxy.ts` matcher: the `llms.txt` one does not match it. Do **not** add it to `KNOWN_ROUTES_EXACT`.
  - It is in neither `sitemap.ts` nor the `robots.txt` rules, same as `llms.txt`.
- `lastModified` never comes from `new Date()`. Only the three static routes carry one, `STATIC_PAGE_LAST_MODIFIED` from `lib/seo.ts`, bumped by hand when the copy changes. Media entries carry no `lastmod` at all: we do not know when a media page last changed. The field is optional, and crawlers ignore one they cannot corroborate. Don't read the clock in `sitemap.ts` — that would make `/sitemap.xml` dynamic under Cache Components, and it is prerendered today.
- **JSON-LD lives in `src/lib/jsonLd.ts`.** It exports `siteJsonLd()` (an `@graph` of Organization, WebSite and WebApplication, rendered on `/`), `faqJsonLd()` (a `FAQPage`, also rendered on `/`), `aboutPageJsonLd(name, description)` (an `@graph` of AboutPage and Organization, rendered on `/about`), `mediaJsonLd(media, mediaType)` (`Movie` or `TVSeries`) and `breadcrumbJsonLd(media, mediaType)` (two items: Home, then the media title), both rendered by `components/MediaPage.tsx`, plus `jsonLdScript()`, which serialises a payload and escapes `<` so a `</script>` in a TMDB overview cannot close the tag early.
  - `faqJsonLd()` reads `HOME_FAQ` from `src/lib/homeFaq.ts`, the same array `(app)/HomeAbout.tsx` renders as the accordion. Edit the copy there once and both the markup and the structured data move together. Never retype a question or answer at either call site.
  - Every script tag sits **outside every Suspense boundary** and is built from the cached TMDB `baseMedia`, never from `getEnrichedMedia`. Inside a boundary the block would stream after the shell and miss the prerendered HTML.
  - The Organization node comes from one shared `organizationNode()` helper, used by both `siteJsonLd()` and `aboutPageJsonLd()`. Never retype its fields at a second call site. `/about` ships the full node, not a bare `@id` reference: a cross-page reference does not resolve for a validator reading `/about` alone.
  - `mediaJsonLd()` sets `'@id'` to `` `${url}#media` ``, always present. `startDate` is series only, from `media.release_date` (`normalizeSeriesResult` maps TMDB `first_air_date` onto it). `duration` is ISO 8601 from `media.runtime` and **movies only**: for a series `runtime` is `episode_run_time[0]`, a per-episode value, so publishing it as the series duration would state something false. `numberOfSeasons` and `numberOfEpisodes` are series only, from the TMDB scalars, omitted when absent or 0.
  - `sameAs` is an array: the TMDB page, then the Wikidata and IMDb URLs from the cached `external_ids` via `getExternalIds`, each omitted when absent.
  - URLs come from `absoluteUrl()`, `SITE_URL` and `toHref()`, the same calls the pages canonicalise with. Images use `tmdbSocialImageUrl()` — crawlers fetch the raw URL with no loader, so the `w780` bucket is required.
  - Any key whose source is absent is omitted. Never emit `null` or `""`.
  - The Organization `logo` is `public/icons/icon-512.png`, the square PWA icon, with explicit `width` and `height`. Google requires at least 112x112 and rejects anything smaller. Do not point it back at `/logo.webp`: that wordmark is 400x54 and fails the check. Any replacement must stay square and 112px or larger.
  - **No `aggregateRating`.** No `SearchAction` either: `/search?query=` is noindex.
  - No JSON-LD on noindex pages: auth routes, `/collection`, `/profile`, `/search`.
- **`app/opengraph-image.png` is the site-wide OG image**, a static 1200x630 file. It covers Twitter too, so there is no `twitter-image` file: Next falls back to the OG image for `twitter:image` when no `twitter-image` file exists.
  - `app/opengraph-image.alt.txt` holds the alt text and becomes `og:image:alt` and `twitter:image:alt`.
  - Next serves it at `/opengraph-image.png?<content-hash>` and emits `og:image:width`, `og:image:height` and `og:image:type` from the file itself. Nothing in `lib/seo.ts` or the root layout references it — never hardcode the URL in `openGraph.images`, that overrides the file convention and loses the hash.
- **`app/manifest.ts` serves `/manifest.webmanifest`**, the web app manifest that makes the site installable. `name` and `description` come from `SITE_NAME` and `SITE_DESCRIPTION` — never hardcode the brand string or the domain there.
  - `background_color` and `theme_color` are the literal `#0d0d10` (the `bg` token). Manifest JSON cannot read CSS vars, so that is the one place the hex is written out. The matching `themeColor` lives in the root layout's `viewport` export, and the two must stay in sync.
  - Same rule as `app/llms.txt/route.ts`: the handler reads no `cookies()`, `headers()` or Supabase, so it prerenders as static under Cache Components. Keep it that way — no `export const dynamic`.
  - It reaches signed-out visitors because `manifest.webmanifest` is excluded from the `proxy.ts` matcher. Do **not** add it to `KNOWN_ROUTES_EXACT` — that would make it private and redirect signed-out visitors to `/login`, so the install prompt would never appear.
  - `start_url` and `scope` are `/`, an open route, so a signed-out install lands on a real page instead of a login redirect. Never point `start_url` at a private route.
  - Icons live in `public/icons/` (`icon-192.png`, `icon-512.png` at `purpose: 'any'`, `icon-maskable-512.png` at `purpose: 'maskable'`). These are exempt from the 2x pre-sizing rule above: launchers need them at their stated pixel size. `icon-512.png` is also the Organization logo in `lib/jsonLd.ts`, so renaming it breaks the structured data too.
  - iOS ignores the manifest `display` field, which is why the root layout also sets `metadata.appleWebApp`. Removing that block breaks standalone launch on iOS only, and nothing in the Chrome install report catches it.
  - **No service worker.** There is no `public/sw.js`, no `serwist`, no `next-pwa`. A service worker needs a new dependency and interacts badly with PPR — it is a separate decision, not something to add alongside a manifest change.

### Security headers

Sent from `next.config.ts` via `async headers()` on `source: '/:path*'`, so they cover pages, route handlers and the metadata routes alike. `proxy.ts` excludes `sitemap.xml`, `robots.txt`, `llms.txt` and `manifest.webmanifest` from auth, but `headers()` still applies to them.

| Header                      | Value                                                          | Why                                     |
| --------------------------- | -------------------------------------------------------------- | --------------------------------------- |
| `X-Content-Type-Options`    | `nosniff`                                                      | Stops MIME sniffing of responses        |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                              | No path or query leaks to third parties |
| `X-Frame-Options`           | `DENY`                                                         | Clickjacking cover for old browsers     |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | The app needs none of these APIs        |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload`                 | HTTPS only, two years                   |
| `Reporting-Endpoints`       | `csp-endpoint="<Sentry security endpoint>"`                    | Names the endpoint CSP `report-to` uses |

**CSP ships as `Content-Security-Policy`** — the browser blocks anything the policy does not list.

- Do **not** replace it with a nonce-based CSP in `proxy.ts`. A per-request nonce forces every route dynamic and destroys the PPR static shell (`cacheComponents: true`).
- `script-src` keeps `'unsafe-inline'` because Next.js streams the RSC payload through inline scripts. `style-src` keeps it for the same reason. So the policy does not stop inline-script injection; it stops loading scripts from an attacker-controlled domain.
- Origins are: `image.tmdb.org` for posters (the custom loader points straight at TMDB), `*.supabase.co` for avatars and browser-side Supabase calls, `va.vercel-scripts.com` for `@vercel/analytics` in dev and preview. In production that script is served same-origin from `/_vercel/insights/script.js`. `*.sentry.io` in `connect-src` for browser error reports, sent to the ingest host in `SENTRY_DSN` (`lib/sentryDsn.ts`). The host wildcard matches any depth, so it covers `o4512091748106240.ingest.de.sentry.io`.
- `img-src` and `connect-src` also carry the origin of `NEXT_PUBLIC_SUPABASE_URL`. Local development and the e2e suite point at it, which is neither `'self'` nor covered by the `*.supabase.co` wildcard, so without it every browser-side Supabase call is blocked locally.
- Fonts come from `next/font/google` and are self-hosted, so `font-src 'self'` is correct. Do not add `fonts.gstatic.com`.
- `manifest-src 'self'` is redundant next to `default-src 'self'`, but Safari has historically needed it named, so it stays. There is no `worker-src` because there is no service worker.
- Add a new third-party origin to the policy in the same PR that adds the dependency, or its requests will show up as violation reports.
- The policy ends with `report-uri <Sentry security endpoint>` and `report-to csp-endpoint`, both built from `SENTRY_CSP_REPORT_URL` in `lib/sentryDsn.ts`. That module holds the one copy of `SENTRY_DSN`, read by the three Sentry init files too — never retype the public key.
- `lib/captureSecurityEvent.ts` sends a named `SecurityEvent` to Sentry at `warning` level with `tags: { security: true }`. Call it from a rejection branch in a route handler only (bad cron secret, forged webhook, failed auth callback), never for a normal user error, and pass nothing but the name: no bodies, tokens, emails or user ids. It returns early outside `NODE_ENV=production`: the DSN is unconditional, so without that the e2e suite would fire the alert on T5, T9 and T13.

---

## Next.js 16 — Important Changes

Agents trained before Next.js 16 will get these wrong. Follow these patterns strictly. All four still hold on 16.4.6: `cookies()` and `headers()` return promises, there is no `next-lint` command, `proxy.ts` is the middleware file, and `revalidateTag(tag, profile)` still requires the profile.

**Async request APIs — synchronous access is removed:**

```ts
// ❌ Does not work in Next.js 16
export default function Page({ params, searchParams }) {
  const cookieStore = cookies();
}

// ✅ Always await params, searchParams, cookies(), headers(), draftMode()
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const search = await props.searchParams;
  const cookieStore = await cookies();
  const headersList = await headers();
}
```

**`next lint` is removed** — use `eslint` directly (already correct in this project).

**Middleware** — `middleware.ts` is deprecated, use `proxy.ts` instead.

**Cache APIs:**

```ts
// ❌ Old
revalidateTag('posts');

// ✅ New — requires a cacheLife profile as second argument
revalidateTag('posts', 'max');

// ✅ Use updateTag() in Server Actions for immediate cache invalidation + refresh
import { updateTag } from 'next/cache';
export async function updatePost(id: string) {
  await db.posts.update(id);
  updateTag(`post-${id}`);
}
```

### Cache Components (PPR) — enabled

`cacheComponents: true` is set in `next.config.ts`. Partial Prerendering is active: every route renders a static shell at build time, cached data streams from the edge, and per-request user data streams in via Suspense.

The 16.2+ knobs are deliberately not adopted: `images.maximumResponseBody` is inert under `loader: 'custom'`, `experimental.maxPostponedStateSize` (the postponed-body cap, default 100 MB) is nowhere near binding, and `partialPrefetching` — which 16.4 warns about on every build — is its own decision.

Read `.agents/skills/next-cache-components/SKILL.md` before touching cache boundaries.

**TMDB data is cached with `use cache`** — never use `next: { revalidate }` on fetch calls. The old pattern is gone. Use the directive at function level:

```ts
import { cacheLife, cacheTag } from 'next/cache';

export async function getMovieDetails(id: string) {
  'use cache';
  cacheLife('days');
  cacheTag(`movie-${id}`);
  // fetch without next: { revalidate }
}
```

Cached TMDB services: `getTrendingMovies` (`trending-movies`), `getMovieDetails` (`movie-<id>`), `getSeriesDetails` (`series-<id>`), `getPopularMovies` (`popular-movies-<page>`), `getPopularSeries` (`popular-series-<page>`). All use `cacheLife('days')`.

`getMovieDetails` and `getSeriesDetails` both fetch `append_to_response=credits,recommendations,watch/providers` — one request per detail page. Never split a new field into a second fetch; widen the append list instead.

- `getWatchProviders(id, mediaType, region)` returns one region's slice of that same cached response, or `null`. The full country map is stripped before `NormalizedMedia`, which reaches a client component. `lib/watchRegion.ts` resolves it: `toWatchRegion` takes `x-vercel-ip-country` and returns a two-letter code or **`null`**. There is no default country. A null region renders `WatchRegionUnknown` instead of another country's providers, and skips the provider fetch. `WATCH_REGION` in `.env.local` stands in for the geo header in local dev, which has none; leave it unset in production.
- `components/WhereToWatch.tsx` renders it, fed by `ViewerWatchProviders` in `MediaPage` inside its own `<Suspense fallback={<WhereToWatchSkeleton />}>` (text-free), passed to `MediaDetail` as `whereToWatch`. Every viewer gets one link per logo via `lib/providerWatchUrl.ts`: the exact title page where Wikidata has a provider id, else that provider's search for the title, else `providers.link`. Deep links come from `services/getProviderDeepLinks.ts` (Wikidata `Special:EntityData`, `'use cache'` + `cacheLife('days')`, real `User-Agent`, fails open to `{}`) keyed by the brand keys in `lib/providerDeepLinks.ts`; the Wikidata id is `external_ids.wikidata_id` off the existing TMDB detail response via `getExternalIds`, awaited in `MediaPage` and passed down as a prop. Roughly 1 in 7 provider slots has one today — that is expected. Logos dedupe by brand, not id: `BRANDS` in that module groups tiers like Netflix `8`/`1796`, and `providerBrandKey()` is the one key both readers use; unmapped ids keep their own key. TMDB may omit `link`, so `providerWatchUrl` returns `undefined` and the logo renders unlinked. The "Streaming data provided by JustWatch" credit is mandatory. No JSON-LD for it.

- They normalize `runtime` (movies use `runtime`, series fall back to `episode_run_time[0]` then `last_episode_to_air.runtime`), `vote_average` and `vote_count` onto `NormalizedMedia`. `getSeriesDetails` also passes through the TMDB scalars `number_of_seasons` and `number_of_episodes` — never `seasons.length`, which counts the Specials entry. Search results never carry them.

#### TMDB content terms

Four constraints from the [API terms](https://www.themoviedb.org/api-terms-of-use) and [logo attribution](https://www.themoviedb.org/about/logos-attribution) rules, verified 2026-11-23. The code satisfies all four today — do not drift.

- **Showing the `overview` verbatim is licensed, on condition of attribution**: the exact notice plus the TMDB logo, shipped by `components/TmdbAttribution.tsx` in `Footer` (every route) and `AuthFormLayout`. Removing either breaks the licence, not just the look.
- **Never paraphrase, rewrite or LLM-summarise an overview.** The terms forbid derivatives of TMDB Content, and forbid training or running ML/AI on it. Truncating for a meta description is excerpting and stays fine.
- **Never persist `overview` into Supabase.** The terms cap caching of TMDB information at 6 months. `use cache` with `cacheLife('days')` is inside that; a database column is not. The `media` table has no `overview` column — keep it that way.
- **Posters stay on TMDB's CDN.** The terms forbid using TMDB as an image host for our own assets, and re-hosting posters in Supabase Storage would be an uncapped cache. `lib/imageLoader.ts` pointing at `image.tmdb.org` is the compliant path.

Commercial use (ads, paid tiers) needs a separate written TMDB agreement, so monetisation is a licence question before it is a product one.

**User-specific Supabase data must stream via Suspense** — it cannot live inside `use cache` (cookies/headers are forbidden there). Lift the cached fetch into the parent Server Component, then wrap the user-enriched subtree in `<Suspense>`:

```tsx
// MediaPage pattern: cached TMDB awaited directly, user data streams
const tmdbData = await getMovieDetails(id);          // cached, fast
return (
  <MediaDetail
    media={tmdbData}                                 // TMDB block, rendered once
    actions={
      <Suspense fallback={<MediaActionsSkeleton />}>
        <UserEnrichedActions ... />                  // reads cookies, Supabase
      </Suspense>
    }
  />
);
```

**Approved Suspense boundaries (do not remove):**

- `(app)/layout.tsx` — `Header` wrapped with `HeaderSkeleton` fallback; `ScrollReset` in its own Suspense; `<Footer />` renders on every route (TMDB attribution must show for every viewer) through `RouteFooter`, a client wrapper that renders only `<Footer />`. `Footer` has two variants, set by one `attributionOnly` prop that `RouteFooter` passes from the same `pinned` flag: the pinned variant is `<footer>` plus `TmdbAttribution` only, no nav or copyright; the in-flow variant is full nav, copyright and attribution. On `INFINITE_SCROLL_ROUTES` (`lib/infiniteScrollRoutes.ts`: `/search`, `/collection`) it is a `shrink-0` sibling after `main`, so an in-flow footer is never stuck behind `MediaList` infinite scroll. Elsewhere it is the last child inside `main`, pushed down by `mt-auto`. Page roots that fill `main` use `grow`, never `min-h-full`, or the footer lands below the fold on short pages. `main` is the scroll container, so an `IntersectionObserver` inside it must root on `main`, not the viewport. The layout itself is a sync function (no top-level cookie access) so the static shell prerenders.

**`services/getCurrentUser.ts` is the only server-side `auth.getUser()` call site.** It is wrapped in React `cache`, so every server component, service and server action in one request shares a single round trip. Use it for every server-side authentication check — never call `supabase.auth.getUser()` directly. Two exceptions: `proxy.ts` runs its own client outside React, and client components (`ProfileContent`, `hooks/useUserMedia`) use the browser client, where `cache` does not apply.

- `(app)/page.tsx` — `getTrendingMovies()` awaited directly; `RecentWatched` streams via `<Suspense fallback={null}>`.
- `components/MediaPage.tsx` — TMDB cached fetch awaited directly and rendered **once**, outside every boundary, by `MediaDetail` → `MediaInfoHeader`. Two server-rendered `<Suspense>` subtrees are handed to `MediaDetail` as the `actions` and `form` props: `UserEnrichedActions` → `MediaActions` (step 1) and `UserEnrichedForm` → `MediaEntryForm` (step 2). Both call `getEnrichedMedia`, which is wrapped in React `cache`, so they share one Supabase round trip.

**Never put TMDB copy in a Suspense fallback on the media pages.** The old fallback was `<MediaDetail media={baseMedia} pending />`, which re-rendered the real `h1`, genres, director, date and overview; the streamed tree then rendered all of it again, so crawlers saw two `h1`s and duplicated text on ~80 sitemap URLs. `MediaActionsSkeleton` is text-free by design: two `Skeleton` blocks with `aria-busy="true" aria-live="polite"`.

**Do not add `export const dynamic` / `force-dynamic`** to routes. PPR handles dynamicity per Suspense boundary. Use `connection()` only when a subtree must opt out of prerendering entirely (not currently needed).

---

## Git Workflow

Always create a PR

- **One branch per task, branched from `main`.** Before starting any task, run `git checkout main && git pull origin main`, then create a fresh branch named `agent/<short-description>` (e.g. `agent/add-movie-search`). Never commit to an existing feature branch that belongs to another task.
- **One PR per task.** Each PR must contain only the changes for its task. Do not mix changes from multiple tasks into a single PR.
- Keep commits small and focused
- Commit message format: `type: short description` (e.g. `feat: add movie search`, `fix: correct rating display`)
- Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`
- Run `npm run lint` before opening a PR — `type-check` and `test` run automatically on pre-push
- PR title should match the commit format; include a brief description of what changed and why

---

## Agent Skills

Project-specific skills are in `.agents/skills/`. Consult them before working on relevant tasks:

- `accessibility` — audit and improve web accessibility following WCAG 2.2 guidelines
- `frontend-design` — UI and design patterns for this project
- `next-best-practices` — Next.js conventions and patterns for this project
- `next-cache-components` — how to use the Next.js 16 `"use cache"` directive and Cache Components
- `nextjs-architecture-guardrails` — high-level decision-making rules for Next.js 16 + Supabase; prevents over-engineering and wrong patterns
- `react-performance-optimization` — memoization, rendering, and React performance techniques
- `seo` — optimize for search engine visibility, meta tags, structured data, sitemaps
- `supabase-postgres-best-practices` — Supabase and PostgreSQL patterns, RLS, queries
- `tailwind-css-patterns` — Tailwind CSS utility-first styling, responsive design, layout utilities
- `typescript-advanced-types` — generics, conditional types, mapped types, template literals, utility types
- `vercel-composition-patterns` — React composition patterns, compound components, render props, context providers
- `vercel-react-best-practices` — Vercel-specific deployment and React patterns

---

## Approach

- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

---

## Communication Style

- Short sentences only (8-10 words max)
- No filler, no preamble, no pleasantries
- Never use em-dashes or replacement hyphens
- Avoid parenthetical clauses entirely
- Hyphens map to standard grammar only
- Code stays normal. English gets compressed
- Tool first. Result first. No explain unless asked
- Do NOT explain what you are about to do before doing it
- Skip summaries between steps
- Only report when a task is fully complete or when you need input

---

## What to Ask Before Doing

- Adding a new npm dependency → confirm first
- Changing Supabase schema or RLS policies → confirm first
- Deleting or renaming files → confirm first

---

## Unit Tests

Vitest, jsdom and React Testing Library. Run with `npm run test`.

- Test files are co-located as `src/**/<name>.test.ts(x)`, next to the module under test. `vitest.config.mts` `include` scopes to `src/`, so nothing outside it is collected.
- `vitest.config.mts` reads the `@/` alias out of `tsconfig.json` — never restate the path there.
- `vitest.setup.ts` registers the jest-dom matchers and runs the RTL `cleanup` after each test. Both are imported only `if (typeof document !== 'undefined')` — the setup file runs for the node-environment files too, where loading them cost seconds per file.
- **A test with no DOM opens with `// @vitest-environment node`**, the first line of the file, above the imports. Every `src/lib`, `src/services`, `src/app` and route-handler test does. jsdom is the config default and costs seconds of environment setup per file. `environmentMatchGlobs` is gone in Vitest 4, so the docblock is the per-file switch; the config-level alternative is `test.projects`.
- `globals` is off: import `describe`, `it`, `expect` and `vi` from `vitest` in every test file.
- Assert an absence with fake timers or `await act(async () => {})`, never a real `setTimeout` sleep.
- Do not assert Tailwind classes. Assert the behaviour (`toBeDisabled()`), so a restyle that keeps the contract cannot fail.
- Playwright stays in `e2e/`. Vitest `exclude` covers it, and `playwright.config.ts` is scoped to `testDir: './e2e'`, so neither runner ever sees the other's files.
- No network calls in the suite — mock `fetch` and `next/cache`.
- Every route handler in `src/app/api/` has a `route.test.ts` beside it. They cover branch logic only, with the services, the Supabase clients and `fetch` mocked, and build the request with `new Request(...)` (`NextRequest` only where the handler reads `nextUrl`).
- Component tests: `vi.mock('next/navigation', () => import('@/test/navigation'))` gives a shared `router` spy and a settable `navigation.pathname` / `searchParams`; `renderWithQuery` from `src/test/render.tsx` wraps a fresh `QueryClient` with retries off, and `queryWrapper()` beside it is the same provider as a `renderHook` wrapper. jsdom lacks `IntersectionObserver` and `scrollIntoView` — stub them in the test that needs them.
- `src/test/supabaseMock.ts` is the chainable server-client mock for `services/` tests. Each `from(table)` records its builder calls and resolves to the next result queued with `respond(table, ...)`. `then`, `catch` and `finally` are delegated to that result rather than recorded as steps. Assert the recorded calls, never Postgres or RLS behaviour. Browser-client hooks mock `@/lib/supabase/client` with `createClient: () => supabase.client`; it also stubs `auth.getUser`, which `reset()` clears.
- `src/test/imageSource.ts` `sourceOf(img)` reads the URL a component handed `next/image`. Vitest does not apply `images.loaderFile`, so the src is the `/_next/image?url=` fallback — never assert that shape at a call site.
- `src/components/Skeletons.test.tsx` holds the text-free and `aria-busy` invariants for every skeleton in one `it.each` table, via `expectTextFree` in `src/test/textFree.tsx`. Add a new skeleton to that table. `HeaderSkeleton` is deliberately out: its nav copy is real text.

---

## End-to-End Tests

Tests live in `e2e/` and use Playwright. Run with `npx playwright test`.

**Current coverage:**

| File                      | Tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.spec.ts`            | T1 login + logout, T2 login validation, T3 registration validation + confirm-email, T4 confirm-callback → registration-confirmed, T5 confirm-callback no code → login toast, T6 registration-confirmed redirects logged-in user, T7 auth redirect + rurl, T8 forgot-password, T9 reset-callback failure, T10 reset-password validation, T11 reset-password rejects non-recovery session, T12 reset happy path, T13 oauth-callback no code → /login?error=oauth_failed, T14 login Google button starts the OAuth flow, T15 register offers Google sign-in, T16 oauth_failed toast |
| `search.spec.ts`          | T5 search, filter movies, open detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `collection.spec.ts`      | T6 add to "to watch", T7 add to "watched" via entry form, T8a move to watched, T8b delete item, T9 tabs + title filter, T21 rating multi-select (watched tab only)                                                                                                                                                                                                                                                                                                                                                                                                               |
| `watch-providers.spec.ts` | T22 where to watch links each logo to its provider, T24 brand variants dedupe to one logo, T25 ads-only region still renders, T26 no geo header says the region is unknown                                                                                                                                                                                                                                                                                                                                                                                                       |
| `rls.spec.ts`             | Access rules, no browser: another user cannot read, update, delete or insert `user_media`; cannot read, update or create `profiles`; cannot download, upload into or remove `avatar` objects; no signed-in user can update, upsert over or insert a shared `media` row; signed-in and signed-out clients get `42501` on `deleted_accounts`. Owner reads are the controls                                                                                                                                                                                                         |
| `profile.spec.ts`         | T10 update display name, T11 delete account, T12 invalid email error, T13 valid email change, T14 avatar upload (resized WebP stored), T15 avatar over 1 MB rejected, T16 avatar disallowed type rejected, T17 stored avatar is WebP capped at 128px, T18 delete account clears avatar folder and user rows                                                                                                                                                                                                                                                                      |

**Rules:**

- Tests are self-contained; no shared state between tests.
- Prefer `page.getByRole()`, `page.getByLabel()`, `page.getByText()` over CSS selectors.
- Password fields need `getByLabel('Password', { exact: true })` — the `PasswordInput` toggle is labelled "Show password".
- Auth helpers live in `e2e/fixtures/` and `e2e/admin.ts`.
- Environment guard in `e2e/env.ts` blocks tests from running against remote/prod Supabase.
- `e2e/global-setup.ts` warms the routes the suite visits before any test runs. A cold `next dev` compile of `/movie/[id]` alone takes ~30s, which used to blow the per-test timeout. Add a route there when a new spec navigates somewhere new.
- `playwright.config.ts` derives the dev server port from `E2E_BASE_URL`; the suite runs on 3001 so it never fights the dev server on 3000.
- `playwright.config.ts` pins the watch region: `extraHTTPHeaders` sends `x-vercel-ip-country: US`, and `webServer.env` blanks `WATCH_REGION` so a developer's `.env.local` cannot change which region the suite sees. Without the blank, every provider assertion silently tests whatever region that file names.
- CI has no `E2E_BASE_URL`, so it uses the config default (port 3000) and reads `NEXT_PUBLIC_SITE_URL` from the GitHub repo variable. Those two must agree: `register()` and `sendPasswordReset()` return early when the site URL is unset, and T3/T8 then fail with no visible error.
- `e2e/global-setup.ts` asserts the private `avatar` bucket exists; it does not create it. A failure there means the local database is behind — run `npx supabase db reset`.
- The `isolatedUser` fixture clears the user's avatar folder on teardown. `storage.objects` has no FK to `auth.users`, so admin user deletion leaves objects behind.

---

## After Completing a Task

- Update `AGENTS.md` if the task changed project structure, schema, conventions, or added new components. The added AGENTS.md added description should be as short as possible.
- Update `DESIGN.md` if the task added or changed any page, layout, or visual design. The added DESIGN.md description should be as short as possible.
- Revisit the JSON-LD in `src/lib/jsonLd.ts` **only when the task changed something the structured data already claims, or added a page type Schema.org covers.** Needed when: an indexable page is added or removed, the copy a node quotes changes (`SITE_NAME`, `SITE_DESCRIPTION`, the `/about` consts), a media field a node emits starts or stops being fetched, or a URL a node points at moves. Not needed for styling, private routes, noindex pages, refactors that keep the same values, or any new field nothing in `jsonLd.ts` reads. Do not invent new nodes or properties to fill a gap the task did not touch — a wrong or stale claim is worse than an absent one
- Bump `STATIC_PAGE_LAST_MODIFIED` in `src/lib/seo.ts` if the task changed the copy on `/`, `/about`, `/terms` or `/privacy` — it is the `lastmod` those sitemap entries carry, and nothing updates it automatically

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
