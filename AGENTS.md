# CineCircle

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
    (auth)/                   # public routes — login, register, confirm-email
      AuthFormLayout.tsx      # shared layout for auth forms
      layout.tsx
    (private)/                # all protected routes
      (with-header-search)/   # pages with search input in header
        search/               # /search
          page.tsx
          SearchResults.tsx
        layout.tsx
      (without-header-search)/# pages without search input in header
        movie/[id]/           # /movie/:id
          page.tsx
        my-media/             # /my-media
          page.tsx
          MyMedia.tsx
          UserMediaList.tsx
        series/[id]/          # /series/:id
          page.tsx
        layout.tsx
      api/                    # Route Handlers
    layout.tsx                # root layout
    globals.css
    providers.tsx             # app-wide React context providers
    proxy.ts                  # Next.js 16 middleware (formerly middleware.ts)
    types.ts                  # app-wide TypeScript types
  components/                 # shared components
  hooks/                      # custom React hooks
  icons/                      # icon components
  lib/                        # utilities, helpers, constants
  services/                   # data fetching / API service functions
```

- Auth is handled in `proxy.ts` (middleware) — unauthenticated users are redirected to `/login` before any page renders. Do not add auth checks in individual pages or layouts.
- To add a new public route, add it to the `PUBLIC_ROUTES` array in `proxy.ts`
- `proxy.ts` is the Next.js 16 middleware file (replaces `middleware.ts`)
- Keep data fetching logic in `services/` — don't inline fetch calls in components

---

## Styling

Tailwind CSS v4 with custom design tokens defined in `globals.css`.

**Design tokens:**

- `text-primary` / `bg-primary` / `color-primary` — main text/background color (gray-100)
- `text-secondary` / `bg-secondary` / `color-secondary` — muted text/background (gray-400)
- `bg-dark` / `color-dark` — dark background (`#1e2122`)
- `text-accent` / `color-accent` — accent/highlight color (blue-300)
- `--background-gradient` — page background gradient (CSS variable, applied on `body`)
- `--height-full-screen` — full viewport height minus header and bottom margin (`calc(100vh - 176px)`)
- `--max-width-content` — max content width (`1440px`)
- `font-sans` — Lato font

**Rules:**

- Mobile-first — use base styles for mobile, `sm:` / `md:` / `lg:` for larger screens
- Always use design tokens for colors — never hardcode hex values like `#1e2122`
- Before adding a new color, check if an existing token fits
- Use `max-w-content` for page-level content wrappers
- Check existing components in `components/` for patterns before building new UI

---

## Supabase

- Use the **server client** (`lib/supabase/server.ts`) in Server Components and Route Handlers
- Use the **browser client** (`lib/supabase/client.ts`) in Client Components only
- Never expose the service role key — it must only be used server-side
- Row Level Security (RLS) is enabled — always test that policies enforce access correctly
- Do not run raw SQL migrations manually; use Supabase migrations (`supabase/migrations/`)

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

---

## Git Workflow

Always create a PR

- Create a feature branch named `agent/<short-description>` (e.g. `agent/add-movie-search`)
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

## What to Ask Before Doing

- Adding a new npm dependency → confirm first
- Changing Supabase schema or RLS policies → confirm first
- Deleting or renaming files → confirm first
