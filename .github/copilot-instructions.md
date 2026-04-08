# CineCircle — Copilot Instructions

A web app for tracking and sharing watched movies with friends.

**Stack:** Next.js 16 (App Router) · React · TypeScript · Supabase · Tailwind CSS v4

---

## Code Style

- **TypeScript strict mode** — no `any`, no `// @ts-ignore` without justification
- **ESLint + Prettier** are configured — follow them strictly; never disable rules inline without a comment explaining why
- Named exports preferred over default exports (exception: Next.js page/layout files)
- Use `const` by default; `let` only when reassignment is needed
- Prefer `async/await` over `.then()` chains
- Fix all ESLint errors before committing — warnings are acceptable, errors are not

---

## Project Structure

```
src/
  app/
    (auth)/                   # public routes — login, register, confirm-email
      AuthFormLayout.tsx
      layout.tsx
    (private)/                # all protected routes
      (with-header-search)/   # pages with search input in header
        search/               # /search
        layout.tsx
      (without-header-search)/# pages without search input in header
        movie/[id]/           # /movie/:id
        my-media/             # /my-media
        series/[id]/          # /series/:id
        layout.tsx
      api/                    # Route Handlers
    layout.tsx
    globals.css
    providers.tsx
    proxy.ts                  # Next.js 16 middleware (replaces middleware.ts)
    types.ts
  components/                 # shared components
  hooks/                      # custom React hooks
  icons/                      # icon components
  lib/                        # utilities, helpers, constants
  services/                   # data fetching / API service functions
```

- Auth is handled in `proxy.ts` (middleware) — do not add auth checks in pages or layouts
- To add a new public route, add it to `PUBLIC_ROUTES` in `proxy.ts`
- Keep data fetching logic in `services/` — don't inline fetch calls in components

---

## Next.js 16 — Critical Patterns

> Copilot may suggest outdated patterns. Always follow these instead.

### Async request APIs — must be awaited

```ts
// ❌ Wrong — synchronous access removed in Next.js 16
export default function Page({ params, searchParams }) {
  const cookieStore = cookies();
}

// ✅ Correct — always await params, searchParams, cookies(), headers(), draftMode()
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const search = await props.searchParams;
  const cookieStore = await cookies();
  const headersList = await headers();
}
```

### Cache APIs

```ts
// ❌ Old
revalidateTag('posts');

// ✅ New — requires a cacheLife profile as second argument
revalidateTag('posts', 'max');

// ✅ Use updateTag() in Server Actions for immediate cache invalidation
import { updateTag } from 'next/cache';
export async function updatePost(id: string) {
  await db.posts.update(id);
  updateTag(`post-${id}`);
}
```

### Other Next.js 16 changes

- `middleware.ts` is deprecated — use `proxy.ts` instead
- `next lint` is removed — use `eslint` directly
- Default to **Server Components**; add `"use client"` only for event handlers, hooks, or browser APIs
- Keep data fetching in Server Components or Route Handlers
- Use `loading.tsx` and `error.tsx` for async boundaries

---

## Supabase

- Use the **server client** (`lib/supabase/server.ts`) in Server Components and Route Handlers
- Use the **browser client** (`lib/supabase/client.ts`) in Client Components only
- Never expose the service role key — server-side only
- RLS is enabled — always ensure policies enforce access correctly
- Do not run raw SQL migrations manually; use Supabase migrations (`supabase/migrations/`)

---

## Styling

Tailwind CSS v4 with custom design tokens in `globals.css`.

| Token                             | Value                            |
| --------------------------------- | -------------------------------- |
| `text-primary` / `bg-primary`     | gray-100 — main text/background  |
| `text-secondary` / `bg-secondary` | gray-400 — muted text/background |
| `bg-dark`                         | `#1e2122` — dark background      |
| `text-accent`                     | blue-300 — accent/highlight      |
| `--background-gradient`           | CSS variable on `body`           |
| `--height-full-screen`            | `calc(100vh - 176px)`            |
| `--max-width-content`             | `1440px`                         |
| `font-sans`                       | Lato                             |

- **Mobile-first** — base styles for mobile, `sm:` / `md:` / `lg:` for larger screens
- Always use design tokens for colors — never hardcode hex values
- Use `max-w-content` for page-level content wrappers
- Check existing components in `components/` before building new UI

---

## Git Workflow

- Branch naming: `agent/<short-description>` (e.g. `agent/add-movie-search`)
- Commit format: `type: short description` (e.g. `feat: add movie search`)
- Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `style`, `test`
- Always open a PR — never push directly to main
- Run `npm run lint` before opening a PR

---

## Ask Before Doing

- Adding a new npm dependency
- Changing Supabase schema or RLS policies
- Deleting or renaming files
