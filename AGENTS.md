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
```

Fix all ESLint errors before committing — warnings are acceptable, errors are not. Do not use `// eslint-disable` without a comment explaining why.

**Hooks (run automatically):**

- **pre-commit** — lint-staged runs ESLint + Prettier on staged `.ts`/`.tsx` files
- **pre-push** — `type-check` runs on the full project

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
        MyMedia.tsx
        UserMediaList.tsx
      profile/                # /profile
        page.tsx
        loading.tsx           # streams profile skeleton via Suspense (PPR — uncached Supabase data)
        ProfileContent.tsx
series/[id]/             # /series/:id
        page.tsx
        loading.tsx           # streams <MediaDetailSkeleton /> via Suspense
      terms/                  # /terms — static Terms and Conditions page (open route)
        page.tsx
      privacy/                # /privacy — static Privacy Policy page (open route)
        page.tsx
      error.tsx               # (app) error boundary (client) — catches runtime errors in (app) routes
      not-found.tsx           # (app) 404 (client) — renders for notFound() calls inside (app)
      layout.tsx
    api/                      # Route Handlers
      auth/
        confirm-callback/
          route.ts            # GET — redirect-only: Supabase's confirmation link verifies the email, then lands here with a code; code present → /registration-confirmed (no session ever created), no code → /login?error=confirm_failed
        reset-callback/
          route.ts            # GET — exchanges email-link code for session, redirects to /reset-password or /login?error=reset_failed
      email/
        inbound/
          route.ts            # POST — Resend inbound email webhook; verifies svix signature (RESEND_WEBHOOK_SECRET), logs received emails
    layout.tsx                # root layout
    not-found.tsx             # root 404 (client) — renders for URLs that match no route at all
    sitemap.ts                # /sitemap.xml — public routes + trending movies
    robots.ts                 # /robots.txt — crawler rules and sitemap pointer
    opengraph-image.tsx       # site-wide default OG image, generated with next/og ImageResponse
  globals.css
  providers.tsx               # app-wide React context providers
  proxy.ts                    # Next.js 16 middleware (formerly middleware.ts) — matcher excludes sitemap.xml and robots.txt
  types.ts                    # app-wide TypeScript types (NormalizedMedia, SavedMedia, RecommendedMedia, etc.)
  components/                 # shared components (SearchBox, Header, MediaInfoHeader, AuthErrorState, etc.)
  hooks/                      # custom React hooks
  icons/                      # icon components
  lib/                        # utilities, helpers, constants
  services/                   # data fetching / API service functions
```

- Auth is handled in `proxy.ts` (middleware) — unauthenticated users are redirected to `/login` before any page renders. Do not add auth checks in individual pages or layouts.
- `proxy.ts` is the Next.js 16 middleware file (replaces `middleware.ts`). Its matcher excludes `sitemap.xml`, `robots.txt` and `opengraph-image` — metadata routes must never be redirected to `/login` or crawlers cannot fetch them
- `AUTH_ROUTES` (`/login`, `/register`, `/confirm-email`, `/forgot-password`, `/registration-confirmed`) — logged-in users are redirected away from these to `/`
- `/reset-password` is not in `AUTH_ROUTES` — it is reached only after the reset-callback exchanges the email-link code for a valid session, so it expects an authenticated user. It receives `error=reset_failed` on the login page (via the `/login?error=reset_failed` redirect) when the callback fails; `LoginForm` surfaces that as a toast.
- `/registration-confirmed` is an auth route in `AUTH_ROUTES` — Supabase's confirmation link verifies the email at click time, and the confirm-callback redirects there without ever creating a session, so the visitor is logged out; logged-in users hitting it are redirected to `/`. On callback failure, the user lands on `/login?error=confirm_failed`; `LoginForm` surfaces that as a toast.
- `KNOWN_ROUTES_EXACT` / `KNOWN_ROUTE_PREFIXES` list every page route the app serves. A path matching neither skips auth and falls through to the root 404 — unknown URLs like `/nonexistent-xyz` or `/llms.txt` must answer 404, not redirect to `/login`
- **A new page route must end up in the known-route list, or it will 404 for everyone.** This check runs first, before the open/auth/private logic. `KNOWN_ROUTES_EXACT` spreads in `AUTH_ROUTES` and `OPEN_ROUTES_EXACT`, so where you add the route decides whether registration is automatic:
  - auth route → `AUTH_ROUTES`. Registered automatically
  - open exact route → `OPEN_ROUTES_EXACT`. Registered automatically
  - open prefix route → `OPEN_ROUTE_PREFIXES` **and** `KNOWN_ROUTE_PREFIXES`. Open prefixes are not spread in, which is why `/search` is also listed explicitly in `KNOWN_ROUTES_EXACT`
  - private route → `KNOWN_ROUTES_EXACT`. Private is the default for known routes
  - session-gated but neither auth nor open, like `/reset-password` → `KNOWN_ROUTES_EXACT` explicitly
- Open routes (no redirect for unauthenticated users): exact match `/`, `/terms`, `/privacy`, plus prefixes `/search`, `/movie/`, `/series/`
- All other known routes require auth — unauthenticated users are redirected to `/login?rurl=<pathname>`
- Keep data fetching logic in `services/` — don't inline fetch calls in components

---

## Styling

Tailwind CSS v4 with custom design tokens defined in `src/globals.css`. Always use these — never hardcode hex values.

**Fonts:**

- `font-sans` — DM Sans (primary body font, weights 300/400/500/600)
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

**Rules:**

- Mobile-first — use base styles for mobile, `sm:` / `md:` / `lg:` for larger screens
- Always use design tokens for colors used in more then one place and tailwind classes for other colors — never hardcode hex values like `#1e2122`
- Before adding a new color, check if an existing token fits
- For borders and overlays without a named token, use Tailwind opacity utilities: `border-white/[0.07]`, `bg-white/4`, etc.
- Check existing components in `components/` for patterns before building new UI
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

### Schema

| Table      | Key columns                                                   | Notes                                   |
| ---------- | ------------------------------------------------------------- | --------------------------------------- |
| `profiles` | `id`, `user_id` (FK→auth.users), `display_name`, `avatar_url` | Auto-created on first `getProfile` call |

### Storage

| Bucket   | Public | Path pattern           | Notes                                                                                |
| -------- | ------ | ---------------------- | ------------------------------------------------------------------------------------ |
| `avatar` | ❌     | `{user_id}/{filename}` | Private. Read and write limited to own folder. Served via signed URLs, 1 hour expiry |

The `avatar` bucket is created by `supabase/migrations/20260917143659_add_avatar_bucket.sql`, so `supabase db reset` gives a fresh local stack a working bucket. Storage RLS policies for it live in the base `remote_schema` migration.

---

## Next.js Conventions

- Default to **Server Components**; add `"use client"` only when needed (event handlers, hooks, browser APIs)
- Keep data fetching in Server Components or Route Handlers — avoid fetching in Client Components where possible
- Use Next.js `loading.tsx` and `error.tsx` files for async boundaries
- Environment variables: server-only vars in `.env.local`, public vars prefixed with `NEXT_PUBLIC_`
- Images use a global custom loader: `images.loader: 'custom'` + `images.loaderFile: './src/lib/imageLoader.ts'`. TMDB URLs are rewritten to the nearest TMDB width bucket (`w92`…`w780`, else `original`) and served straight from TMDB's CDN, which restores `srcset`. All other sources (Supabase avatars, local `/logo.webp`) are returned unchanged.
- Because `/_next/image` is unavailable, non-TMDB images must be pre-sized at the source: `public/logo.webp` ships at 400px wide (2x its 200px render) and avatars are downscaled to 128px WebP by `lib/resizeImage.ts` before upload. Any new local asset must be committed at roughly 2x its render size — do not add a full-resolution PNG to `public/`.
- `images.imageSizes` is `[92, 154]` and `images.deviceSizes` is `[185, 342, 500, 780]` — the TMDB buckets. Do not widen them: the Next.js defaults emit candidates up to 3840, and any candidate above 780 resolves to TMDB `original` (multi-MB) for a poster rendered at 500px.
- Setting any non-default `images.loader` makes Next.js 404 the `/_next/image` optimizer route for every request. Do not write loader output that points at `/_next/image` — it is a dead link. `images.remotePatterns` is likewise inert while the custom loader is active, but the TMDB and Supabase entries are kept so the config stays correct if the loader is ever removed.
- Never pass a `loader` function prop to `next/image` from a Server Component — functions cannot cross the RSC boundary. Use `loaderFile` instead.
- **LCP images carry `priority`.** In Next 16 `priority` emits a `<link rel="preload" as="image">` and drops `loading="lazy"`; it does **not** set `fetchpriority`. That is the separate `fetchPriority` prop. Current `priority` call sites: the `/logo.webp` logo in `Header`, `HeaderSkeleton` and `AuthFormLayout`; the detail poster in `MediaDetailWrapper`; the auth poster grid in `AuthFormLayout`. `fetchPriority="high"` is reserved for the single LCP element per page (the three logos and the detail poster). Do not add either to the "More like this" recommendation posters or widen the `index < 12` rule in `MediaCard` / `MediaList`.
- Build every TMDB image URL with `tmdbImageUrl(path)` from `lib/tmdbImage.ts`. Never hardcode `https://image.tmdb.org/t/p/<size>` at a call site. For social/OG images use `tmdbSocialImageUrl(path)` — crawlers fetch the raw URL with no loader in front of it, so it pins the `w780` bucket.

### Metadata & SEO

All SEO constants live in `src/lib/seo.ts`: `SITE_NAME`, `SITE_URL`, `SITE_TITLE`, `SITE_DESCRIPTION`, `absoluteUrl()`, `truncateDescription()`, `mediaMetadata()`, `NOT_FOUND_METADATA`. `sitemap.ts` and `robots.ts` import `SITE_URL` from there — do not re-derive it from `process.env`.

- The root layout sets `metadataBase: new URL(SITE_URL)` and `title: { default: SITE_TITLE, template: '%s | MidnightFrame' }`. Per-page titles are the bare page name (`'Sign in'`, `'Your Profile'`); the template appends the brand. Use `title: { absolute: ... }` only on the home page.
- `NEXT_PUBLIC_SITE_URL` must be set in every deployed environment or `metadataBase` falls back to `http://localhost:3000`.
- Every indexable page sets `alternates.canonical`. Movie and series pages canonicalise to `absoluteUrl(toHref(id, title, mediaType))`, which collapses every mis-slugged `/movie/123-anything` variant onto one URL. `/search` canonicalises to `/search` with no query string.
- `MediaPage` also redirects every non-canonical slug to `toHref(id, title, mediaType)` with `permanentRedirect`, preserving the query string. `toHref` drops the trailing dash when a title slugifies to nothing, so the comparison always settles and cannot loop. Note the status: `/movie/[id]` is a PPR route, so the prerendered shell flushes 200 before the redirect resolves and Next emits a `<meta http-equiv="refresh">` instead of a 308. A true 308 would have to move into `proxy.ts` and cost a TMDB lookup per request.
- `generateMetadata` may await `params`, `searchParams` and `use cache` services. It must never read `cookies()`, `headers()` or Supabase — no per-user data in metadata.
- noindex list: `(auth)/layout.tsx` (covers every auth route), `/collection`, `/profile`, `/search?query=…`, and unresolvable movie/series slugs. Keep the `robots.ts` `disallow` list in sync with it.
- `app/opengraph-image.tsx` is the site-wide OG image. It covers Twitter too, so there is no `twitter-image` file. Satori has no `oklch()` support — the accent is written there as its sRGB hex equivalent.

### Security headers

Sent from `next.config.ts` via `async headers()` on `source: '/:path*'`, so they cover pages, route handlers and the metadata routes alike. `proxy.ts` excludes `sitemap.xml` and `robots.txt` from auth, but `headers()` still applies to them.

| Header                      | Value                                                          | Why                                     |
| --------------------------- | -------------------------------------------------------------- | --------------------------------------- |
| `X-Content-Type-Options`    | `nosniff`                                                      | Stops MIME sniffing of responses        |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                              | No path or query leaks to third parties |
| `X-Frame-Options`           | `DENY`                                                         | Clickjacking cover for old browsers     |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` | The app needs none of these APIs        |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload`                 | HTTPS only, two years                   |

**CSP ships as `Content-Security-Policy-Report-Only`, not enforcing.** It logs violations without blocking, so a missing origin cannot break the app. Tighten it to the enforcing header only after the reports come back clean.

- Do **not** replace it with a nonce-based CSP in `proxy.ts`. A per-request nonce forces every route dynamic and destroys the PPR static shell (`cacheComponents: true`).
- `script-src` keeps `'unsafe-inline'` because Next.js streams the RSC payload through inline scripts. `style-src` keeps it for the same reason.
- Origins are: `image.tmdb.org` for posters (the custom loader points straight at TMDB), `*.supabase.co` for avatars and browser-side Supabase calls, `va.vercel-scripts.com` for `@vercel/analytics` in dev and preview. In production that script is served same-origin from `/_vercel/insights/script.js`.
- Fonts come from `next/font/google` and are self-hosted, so `font-src 'self'` is correct. Do not add `fonts.gstatic.com`.
- Add a new third-party origin to the policy in the same PR that adds the dependency, or its requests will show up as violation reports.

---

## Next.js 16 — Important Changes

Agents trained before Next.js 16 will get these wrong. Follow these patterns strictly.

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

Cached TMDB services: `getTrendingMovies` (`trending-movies`), `getMovieDetails` (`movie-<id>`), `getSeriesDetails` (`series-<id>`). All use `cacheLife('days')`.

**User-specific Supabase data must stream via Suspense** — it cannot live inside `use cache` (cookies/headers are forbidden there). Lift the cached fetch into the parent Server Component, then wrap the user-enriched subtree in `<Suspense>`:

```tsx
// MediaPage pattern: cached TMDB awaited directly, user data streams
const tmdbData = await getMovieDetails(id);          // cached, fast
return (
  <Suspense fallback={<MediaDetail media={tmdbData} pending />}>
    <UserEnrichedMedia baseMedia={tmdbData} ... />   // reads cookies, Supabase
  </Suspense>
);
```

**Approved Suspense boundaries (do not remove):**

- `(app)/layout.tsx` — `Header` wrapped with `HeaderSkeleton` fallback; `ScrollReset` in its own Suspense. The layout itself is a sync function (no top-level cookie access) so the static shell prerenders.
- `(app)/page.tsx` — `getTrendingMovies()` awaited directly; `RecentWatched` streams via `<Suspense fallback={null}>`.
- `components/MediaPage.tsx` — TMDB cached fetch awaited directly; `UserEnrichedMedia` (Supabase enrichment via `getEnrichedMedia`) streams via Suspense with a `pending` skeleton.

**`pending` prop** — `MediaDetail` and `MediaInfo` accept `pending` to render a `Skeleton` block for action buttons while user data streams. Pass it from the Suspense fallback.

**Do not add `export const dynamic` / `force-dynamic`** to routes. PPR handles dynamicity per Suspense boundary. Use `connection()` only when a subtree must opt out of prerendering entirely (not currently needed).

---

## Git Workflow

Always create a PR

- **One branch per task, branched from `main`.** Before starting any task, run `git checkout main && git pull origin main`, then create a fresh branch named `agent/<short-description>` (e.g. `agent/add-movie-search`). Never commit to an existing feature branch that belongs to another task.
- **One PR per task.** Each PR must contain only the changes for its task. Do not mix changes from multiple tasks into a single PR.
- Keep commits small and focused
- Commit message format: `type: short description` (e.g. `feat: add movie search`, `fix: correct rating display`)
- Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`
- Run `npm run lint` before opening a PR — `type-check` runs automatically on pre-push
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

## End-to-End Tests

Tests live in `e2e/` and use Playwright. Run with `npx playwright test`.

**Current coverage:**

| File                 | Tests                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `auth.spec.ts`       | T1 login + logout, T2 login validation, T3 registration validation + confirm-email, T4 confirm-callback → registration-confirmed, T5 confirm-callback no code → login toast, T6 registration-confirmed redirects logged-in user, T7 auth redirect + rurl, T8 forgot-password, T9 reset-callback failure, T10 reset-password validation, T11 reset-password rejects non-recovery session, T12 reset happy path |
| `home.spec.ts`       | T19 "What is MidnightFrame" renders signed-out, hidden signed-in                                                                                                                                                                                                                                                                                                                                              |
| `search.spec.ts`     | T5 search, filter movies, open detail                                                                                                                                                                                                                                                                                                                                                                         |
| `collection.spec.ts` | T6 add to "to watch", T7 add to "watched" via entry form, T8a move to watched, T8b delete item, T9 tabs + title filter                                                                                                                                                                                                                                                                                        |
| `profile.spec.ts`    | T10 update display name, T11 delete account, T12 invalid email error, T13 valid email change, T14 avatar upload (resized WebP stored), T15 avatar over 1 MB rejected, T16 avatar disallowed type rejected, T17 stored avatar is WebP capped at 128px, T18 delete account clears avatar folder and user rows                                                                                                   |

**Rules:**

- Every new feature or changed user flow requires e2e coverage — assign qa-agent to write tests.
- Tests are self-contained; no shared state between tests.
- Prefer `page.getByRole()`, `page.getByLabel()`, `page.getByText()` over CSS selectors.
- Auth helpers live in `e2e/fixtures/` and `e2e/admin.ts`.
- Environment guard in `e2e/env.ts` blocks tests from running against remote/prod Supabase.
- `e2e/global-setup.ts` warms the routes the suite visits before any test runs. A cold `next dev` compile of `/movie/[id]` alone takes ~30s, which used to blow the per-test timeout. Add a route there when a new spec navigates somewhere new.
- `playwright.config.ts` derives the dev server port from `E2E_BASE_URL`; the suite runs on 3001 so it never fights the dev server on 3000.
- CI has no `E2E_BASE_URL`, so it uses the config default (port 3000) and reads `NEXT_PUBLIC_SITE_URL` from the GitHub repo variable. Those two must agree: `register()` and `sendPasswordReset()` return early when the site URL is unset, and T3/T8 then fail with no visible error.
- `e2e/global-setup.ts` asserts the private `avatar` bucket exists; it does not create it. A failure there means the local database is behind — run `npx supabase db reset`.
- The `isolatedUser` fixture clears the user's avatar folder on teardown. `storage.objects` has no FK to `auth.users`, so admin user deletion leaves objects behind.

---

## After Completing a Task

- Update `AGENTS.md` if the task changed project structure, schema, conventions, or added new components
- Update `DESIGN.md` if the task added or changed any page, layout, or visual design
