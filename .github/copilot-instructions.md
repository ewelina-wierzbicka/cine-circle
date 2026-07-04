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
      login/
        page.tsx
        LoginForm.tsx
      register/
        page.tsx
        RegisterForm.tsx
      confirm-email/
        page.tsx
    (private)/                # all protected routes (single layout)
      page.tsx                # / (home page)
      search/                 # /search
        page.tsx
        SearchResults.tsx
      movie/[id]/             # /movie/:id
        page.tsx
      collection/               # /collection
        page.tsx
        MyMedia.tsx
        UserMediaList.tsx
      series/[id]/            # /series/:id
        page.tsx
      layout.tsx
    api/                      # Route Handlers
    layout.tsx
  globals.css
  providers.tsx
  proxy.ts                    # Next.js 16 middleware (replaces middleware.ts)
  types.ts                    # app-wide TypeScript types
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
- Use the **admin client** (`lib/supabase/admin.ts`) only for privileged operations (bypasses RLS) — server-side only
- Never expose the service role key — server-side only
- RLS is enabled — always ensure policies enforce access correctly
- Do not run raw SQL migrations manually; use Supabase migrations (`supabase/migrations/`)

---

## Styling

Tailwind CSS v4 with custom design tokens defined in `src/globals.css`. Always use these — never hardcode hex values.

**Fonts:**

- `font-sans` — DM Sans (primary body font)
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

- **Mobile-first** — base styles for mobile, `sm:` / `md:` / `lg:` for larger screens
- Always use design tokens for colors — never hardcode hex values
- For borders/overlays without a named token, use Tailwind opacity utilities: `border-white/[0.07]`, `bg-white/4`
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

---

## Approach

- Read existing files before writing. Don't re-read unless changed.
- Thorough in reasoning, concise in output.
- Skip files over 100KB unless required.
- Do not guess APIs, versions, flags, commit SHAs, or package names. Verify by reading code or docs before asserting.

## Communication Style

- Short sentences only (8-10 words max)
- No filler, no preamble, no pleasantries,
- Never use em-dashes or replacement hyphens
- Avoid parenthetical clauses entirely
- Hyphens map to standard grammar only
- Code stays normal. English gets compressed
- Tool first. Result first. No explain unless asked
- Do NOT explain what you are about to do before doing it
- Skip summaries between steps
- Only report when a task is fully complete or when you need input

---
