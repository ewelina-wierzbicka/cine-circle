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
      registration-confirmed/  # /registration-confirmed — email confirmation success page (open route; reached via confirm-callback without a session)
        page.tsx
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
    layout.tsx                # root layout
    not-found.tsx             # root 404 (client) — renders for URLs that match no route at all
    sitemap.ts                # /sitemap.xml — public routes + trending movies
    robots.ts                 # /robots.txt — crawler rules and sitemap pointer
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
- `proxy.ts` is the Next.js 16 middleware file (replaces `middleware.ts`)
- `AUTH_ROUTES` (`/login`, `/register`, `/confirm-email`, `/forgot-password`) — logged-in users are redirected away from these to `/`
- `/reset-password` is not in `AUTH_ROUTES` — it is reached only after the reset-callback exchanges the email-link code for a valid session, so it expects an authenticated user. It receives `error=reset_failed` on the login page (via the `/login?error=reset_failed` redirect) when the callback fails; `LoginForm` surfaces that as a toast.
- `/registration-confirmed` is an open route in `OPEN_ROUTES_EXACT` — Supabase's confirmation link verifies the email at click time, and the confirm-callback redirects there without ever creating a session; authenticated users are not redirected away. On callback failure, the user lands on `/login?error=confirm_failed`; `LoginForm` surfaces that as a toast.
- Open routes (no redirect for unauthenticated users): exact match `/`, `/terms`, `/privacy`, `/registration-confirmed`, plus prefixes `/search`, `/movie/`, `/series/`
- To add a new open route, add it to `OPEN_ROUTES_EXACT` or `OPEN_ROUTE_PREFIXES` in `proxy.ts`
- All other routes require auth — unauthenticated users are redirected to `/login?rurl=<pathname>`
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

  // Accent — pastel mint
  mint: 'oklch(82% 0.10 165)', // maps to CSS var --color-mint
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

| Bucket    | Public | Path pattern           | Notes                                    |
| --------- | ------ | ---------------------- | ---------------------------------------- |
| `avatars` | ✅     | `{user_id}/{filename}` | Users can only write to their own folder |

---

## Next.js Conventions

- Default to **Server Components**; add `"use client"` only when needed (event handlers, hooks, browser APIs)
- Keep data fetching in Server Components or Route Handlers — avoid fetching in Client Components where possible
- Use Next.js `loading.tsx` and `error.tsx` files for async boundaries
- Environment variables: server-only vars in `.env.local`, public vars prefixed with `NEXT_PUBLIC_`

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

## After Completing a Task

- Update `AGENTS.md` if the task changed project structure, schema, conventions, or added new components
- Update `DESIGN.md` if the task added or changed any page, layout, or visual design
