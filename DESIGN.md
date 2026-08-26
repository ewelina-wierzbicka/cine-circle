# MidnightFrame — Design System & Screen Specs

> **This document is a complete design reference** for implementing the MidnightFrame app UI in a React codebase.

---

## Fidelity

**High-fidelity.** All colors, typography, spacing, border radii, shadows, and interactions are specified precisely. Recreate pixel-accurately.

---

## Design Tokens

### Colors

```ts
// tokens/colors.ts
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

> **Token notes:**
>
> - Named CSS variables (`--color-*`) are defined in `src/globals.css` and generate Tailwind utilities directly (e.g. `text-primary`, `bg-mint`).
> - Currently defined CSS variables: `--color-primary`, `--color-secondary`, `--color-dark`, `--color-bg2`, `--color-bg3`, `--color-mint`, and font aliases `--font-sans`, `--font-serif`, `--font-mono`.
> - Gradient variable: `--gradient-blue: linear-gradient(160deg, #1A3A5CED 0%, #1a3a5c66 45%, #0d0d10 100%)`. Use via `@utility bg-gradient-blue { background-image: var(--gradient-blue); }` or the Tailwind class `bg-gradient-blue`.
> - Recommended token → CSS var mapping: `text` → `--color-primary`, `muted` → `--color-secondary`, `bg` → `--color-dark`, `bg2` → `--color-bg2`, `bg3` → `--color-bg3`, `mint` → `--color-mint`.
> - Animation utilities `.animate-fade-up` and `.animate-fade-in` are provided in `src/globals.css`.
> - Note: `src/globals.css` sets `body { overflow: hidden }` and `#root { position: fixed; inset: 0 }`.

### Typography

```ts
// Google Fonts:
// "DM Sans" (300/400/500/600 + italic 300/400)
// "DM Serif Display" (regular + italic)
// "DM Mono" (400/500)

export const fonts = {
  sans: "'DM Sans', sans-serif",
  serif: "'DM Serif Display', serif",
  mono: "'DM Mono', monospace",
};


export const type = {
  heroTitle: {
    fontFamily: fonts.serif,
    fontSize: 'clamp(42px, 5.5vw, 72px)',
    fontWeight: 400,
    letterSpacing: '-0.03em',
    lineHeight: 0.95,
  },
  searchHero: {
    fontFamily: fonts.serif,
    fontSize: '46px (52px at xl)',
    fontWeight: 400,
    letterSpacing: '-0.03em',
    lineHeight: 1.0,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 'clamp(32px, 5vw, 48px)',
    fontWeight: 400,
    letterSpacing: '-0.03em',
    lineHeight: 0.95,
  },
  loginTitle: {
    fontFamily: fonts.serif,
    fontSize: 60,
    fontWeight: 400,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  body: { fontFamily: fonts.sans, fontSize: 14, fontWeight: 400 },
  label: {
    fontFamily: fonts.mono,
    fontSize: 14,
    fontWeight: 400,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
  },
  navItem: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  btnLabel: {
    fontFamily: fonts.sans,
    fontSize: 'medium: 16px (14px at md), small: 14px',
    fontWeight: 600,
    letterSpacing: '0.08em',
  },
};
```

### Border Radius

```ts
export const radius = {
  sm: 6,     // reference value; no 6px usage in code
  md: 10,    // rounded-[10px] — MyMedia tabs
  lg: 12,    // rounded-xl — primary card/input/poster radius (most common)
  xl: 16,    // rounded-2xl — large posters, profile/auth cards
  pill: 999, // rounded-full — pills, avatars, genre badges
};
```

### Shadows

```ts
export const shadows = {
  poster: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07)',
};
```

> **Shadow notes:**
>
> - These are reference values, not Tailwind utilities. They are single-use and applied inline where needed.
> - `poster` is applied via inline `style={{ boxShadow }}` in `src/components/MediaPoster.tsx` (plus an inset vignette `inset 0 0 40px rgba(0,0,0,0.25)` on the same component).
> - Tailwind built-in shadows (`shadow-xl`, `shadow-lg`) are used sparingly off-scale; `SearchBox` focus ring uses an arbitrary `shadow-[0_0_0_3px_oklch(82%_0.10_165/0.12)]`.
> - Retired: `stacked` — never used in code.

### Animations

```ts
export const motion = {
  fadeUp: 'opacity 0→1 + translateY 18px→0, 500ms cubic-bezier(.22,.68,0,1.2)',
  fadeIn: 'opacity 0→1, 400ms ease',
  cardHover: 'translateY(-5px), 220ms cubic-bezier(.22,.68,0,1.2)',
};
```

---

## Shared Components

### TopBar (Header)

- Implemented in `src/components/Header.tsx`.
- Relative header bar (`h-14`) with `px-6 md:px-12` padding.
- Logo 26×26 + `font-mono text-sm font-medium tracking-[0.05em]` wordmark.
- Nav links use `text-sm font-sans font-medium tracking-[0.02em]` and active `bg-white/4 border-secondary/50 text-primary`.
- Right: avatar button with accessible dropdown, keyboard support and route handlers.

### StarRating

- `src/components/StarRating.tsx`.
- Renders 5 stars, supports half-stars via overlay clipping.
- Filled: `text-amber-400`; empty: `text-white/15`.
- Display-only component; used where ratings exist.

### MovieCard (MediaCard)

- `src/components/MediaCard.tsx`.
- Card: `rounded-xl`, `border border-white/[0.07]`, `aspect-2/3`.
- Hover lift (`-translate-y-1.25`) and hover border tint to mint.
- Poster image fills card; placeholder gradient when missing.
- Hover overlay exposes actions or a `VIEW →` label (`font-mono text-sm text-mint`).
- Title/date use `text-sm`; title `font-medium`.
- Shows `StarRating` when `watchStatus === 'watched'` and `rating` present.

### MediaCardOverlay

- `src/components/MediaCardOverlay.tsx`.
- Positioned overlay that slides up on hover.
- Renders action buttons and prevents pointer event propagation to card link.

### MediaPoster

- `src/components/MediaPoster.tsx`.
- Large poster container used in detail pages.
- Rotated card visual (`-1.5deg`), rounded-2xl, heavy shadow and inset vignette.
- Uses placeholder gradient when no poster path.

### MediaInfo & WatchedMediaInfo

- `src/components/MediaInfo.tsx` and `src/components/WatchedMediaInfo.tsx`.
- MediaInfo: actions for adding/removing media, shows director, date, and call-to-action buttons.
- WatchedMediaInfo: shows rating, watched date, and review; includes Update button.
- Both use `font-mono` for labels and `font-serif` for large title with `clamp(42px, 5.5vw, 72px)`.

### MediaDetail & MediaDetailWrapper

- `src/components/MediaDetail.tsx` orchestrates detail UI and form vs info slots.
- `MediaDetailWrapper.tsx` provides backdrop radial gradients and two-column layout with `MediaPoster` on the left (hidden on small screens).

### MediaPage

- `src/components/MediaPage.tsx` is an async wrapper used by route handlers.
- Fetches data via `getMediaPageData`, shows `ErrorToast` on error and `MediaDetail` on success.

### MediaList

- `src/components/MediaList.tsx`.
- Grid list of `MediaCard` components with responsive columns.
- Implements intersection-observer pagination and shows `Loader` while fetching.

### Input

- `src/components/Input.tsx`.
- Controlled input with `variant` prop: `search` adds an icon and padding; `rating` shows `/10` suffix.
- Styles: rounded-xl, `h-11.5`, `bg-bg2`, focus border `mint` and `bg3`.
- Forwards ref and renders error text when provided.

### SearchBox

- `src/components/SearchBox.tsx`.
- Uses `Input`, `useGetMedia` and `useGetMediaDetails` hooks.
- Debounced query, filter chips (All/Movies/Series), dropdown with infinite-scroll via IntersectionObserver.
- Dropdown renders `SearchDropdownItem` entries and supports keyboard/blur closing behavior.

### SearchDropdownItem

- `src/components/SearchDropdownItem.tsx`.
- Renders compact row with poster thumbnail, title, director/year, and media_type tag.
- Navigates on mouseDown to avoid losing focus before click.

### Select

- `src/components/Select.tsx`.
- Accessible custom select with keyboard nav (ArrowUp/ArrowDown/Escape/Enter).
- Renders a listbox when open and highlights selected option.

### DatePicker

- `src/components/DatePicker.tsx`.
- Wraps `react-day-picker` and exposes a read-only `Input` that toggles the calendar.
- Click-outside closes the picker and the DayPicker disables future dates.

### UserEntryForm

- `src/components/UserEntryForm.tsx`.
- Form to add or update a user's watched entry (watched_date, rating, review).
- Uses `react-hook-form`, `DatePicker`, `Input`, `Textarea`, and `Button`.
- Calls `addUserMedia` or `updateUserMedia` and invalidates queries on success.

### Textarea

- `src/components/Textarea.tsx`.
- Styled rounded textarea (`h-30`) with focus styles, forwards ref and shows error messages.

### Button

- `src/components/Button.tsx`.
- Variants: `filled` (default) and `outlined`.
- Colors: `mint` (default) and `error`. Only affects the `filled` variant — `error` filled uses `bg-red-800 text-primary hover:bg-red-900`, `mint` filled uses `bg-mint text-dark hover:opacity-[0.82]`. `outlined` is unaffected by `color`.
- Sizes: `medium` (h-12 text-base) and `small` (h-10 text-sm).
- Uses `uppercase tracking-[0.08em] font-semibold` and merges custom classes via `twMerge`.

### Loader

- `src/components/Loader.tsx`.
- Simple spinner using a bordered circle with `animate-spin`.
- Accepts `fullScreen` prop to fill container height.

### ErrorToast

- `src/components/ErrorToast.tsx`.
- Shows a toast.error when mounted via `react-toastify`.

### HeaderSkeleton

- `src/components/HeaderSkeleton.tsx`.
- Static skeleton for the `(app)` layout `Header`, shown while the authed `Header` (which reads cookies/Supabase) streams in under PPR.
- Matches `Header` geometry: `h-14 px-6 md:px-12`, logo + wordmark, two pill-shaped nav placeholders, and `AvatarIcon` on the right.

### RecentWatched

- `src/components/RecentWatched.tsx` — async Server Component rendering the "Recently Watched" strip on the home page.
- Receives a `Promise<TrendingMovie[]>` (resolved by `getRecentWatched`) and `await`s it; renders `null` when empty.
- Hosts the section header ("RECENTLY WATCHED" + "SEE ALL →") and the horizontal `MediaPoster` scroll. Lifted out of `page.tsx` so the home shell prerenders with the hero and the strip streams in via Suspense.

### Skeleton (loading.tsx skeletons)

- `Skeleton.tsx` — reusable pulsing block sized via `className`. Used by `loading.tsx` files and Suspense fallbacks.
- `MediaDetailSkeleton.tsx` — mirrors `MediaDetailWrapper`: radial gradient backdrop, rotated poster placeholder left, info column right (back link, genre pills, title, meta, divider, overview).
- `MediaCardSkeleton.tsx` — `aspect-2/3` poster block + two text lines. Used in search and collection loading grids.
- Route `loading.tsx` files: movie/series → `MediaDetailSkeleton`; collection → header + card grid; search → SearchBox bar + results grid; profile → heading + profile/account/danger-zone cards.

---

---

## Auth Error Pages

- Routes: `/login/error`, `/register/error`, `/forgot-password/error`, `/reset-password/error` — auth failure pages within the `(auth)` route group.
- Rendered via `AuthErrorState` (`src/components/AuthErrorState.tsx`) — shared client component; accepts `error`, `reset`, `eyebrow`, `title`, and `ctaLabel` props.
- Layout: full-screen `fixed inset-0`, centered content column `max-w-[380px] text-center`, `animate-fade-up`.
- Background: `bg-dark` + 48px grid overlay + bottom-center radial glow in error-red.
- Icon: `LockXIcon`, `text-error`. Body copy: "Something on our end failed. Try again, or continue as a guest."
- CTA calls `reset()`; secondary "Continue as guest" link goes to `/`.

---

## Login/Register

- Implemented by `src/app/(auth)/AuthFormLayout.tsx` with `LoginForm` and `RegisterForm` as children.
- Layout: fixed two-column auth shell (`fixed inset-0 flex`). Left column contains the form; right column (desktop) shows a 3×2 grid of `MediaPoster` tiles fetched from `getTrendingMovies()`.

Left column (Form)

- Form container centered with `max-w-90` (approx 360px) and `animate-fade-up`.
- Heading: `font-serif text-6xl` (Login) or `font-serif text-6xl` (Register) with mint-emphasized word (`<em class="text-mint">`).
- Subtext: `text-base text-secondary`.
- Labels: `font-mono text-sm uppercase tracking-[0.14em] text-secondary`.
- Inputs: use `Input` component — `rounded-xl`, `h-11.5`, `bg-bg2`, `border-secondary/25`, focus shows `border-mint` and `bg-bg3`.
- Buttons: use `Button` component (color `mint`, medium size → `h-12 text-base`). Disabled/pending states handled.
- Footer link toggles between Login and Register using `text-mint` links.

Right column (Visuals)

- Rendered only on `lg` and up (`hidden lg:block`).
- 3×2 grid of `MediaPoster` components; each tile fills its cell.
- Two overlay gradients: a right-to-left dark fade and a top/bottom vignette applied via absolute layers.
- Top-left logo (26×26) and `font-mono` wordmark are positioned absolutely.

---

## Forgot Password / Reset Password

Both reuse `(auth)/AuthFormLayout.tsx` — same fixed two-column shell (form left, `MediaPoster` grid right on `lg+`), top-left logo, shared overlay gradients.

- `/forgot-password` (`ForgotPasswordForm.tsx`) — single email field; on success flips to a "Check your _inbox_" confirmation state with `EnvelopeIcon` chip and tip card. In `AUTH_ROUTES`.
- `/reset-password` (`ResetPasswordForm.tsx`) — two password fields; reached via `reset-callback`. On success signs out and redirects to `/login`. Not in `AUTH_ROUTES`.
- Both: `font-serif text-6xl` title with mint `<em>`, `text-base text-secondary` subtext, `font-mono text-sm` labels, `Button` mint medium CTA, "Back to Sign in" footer link.

---

## Search / Home

- Implemented in `src/app/(app)/page.tsx`.

Layout & Ambient

- `min-h-full` flex column with three absolute radial blobs implemented as blurred rounded divs.
- Blobs mimic movie color accents and a mint blob in the lower-left; implemented via inline `bg-[radial-gradient(...)]` utility classes.

Hero

- Heading implemented as `h2` using `font-serif text-[46px] xl:text-[52px] tracking-[-0.03em] leading-none` with mint emphasis via `<em class="text-mint">`.
- Subtext: `text-secondary text-md` and centered.
- Animations: `animate-fade-up` and `animate-fade-in` with small delays applied to hero and subtext.

Search

- Central SearchBox (`src/components/SearchBox.tsx`) placed in a `max-w-160` wrapper.
- SearchBox internals: `Input` with transparent background in the centered layout, container toggles focus state to `bg-bg2` and `border-mint` plus focus shadow `shadow-[0_0_0_3px_oklch(82%_0.10_165/0.12)]`.
- Filter chips are buttons with `font-mono text-sm tracking-[0.05em]`; active chip uses `bg-mint text-dark font-medium`.
- SearchBox provides `hintTitles` from `getTrendingMovies()` and renders an animated dropdown with infinite-scroll via IntersectionObserver.

Recently Watched

- Streams in via Suspense under PPR. `page.tsx` awaits `getTrendingMovies()` (cached `use cache`) to build the hero `hintTitles`, then hands `getRecentWatched()` (Supabase, per-user) as a promise to `RecentWatched`.
- `RecentWatched` (`src/components/RecentWatched.tsx`) is an async Server Component wrapped in `<Suspense fallback={null}>`; it `await`s the promise and renders nothing when empty.
- `HomeHero` reads the same promise with `use(promise)` inside a `Suspense` to toggle the `hasRecentMedia` flag for the dropdown-shift behavior.
- Each poster link: `shrink-0 rounded-[10px] overflow-hidden border border-white/[0.07] w-27.5 h-41.25` (sized for 110×165px posters).
- Section header: left label `font-mono text-sm tracking-[0.2em] text-secondary uppercase` and right-side `SEE ALL →` link `font-mono text-sm text-mint tracking-[0.08em]`.

- Label "RECENTLY WATCHED" DM Mono 14px secondary + "SEE ALL →" mint
- Horizontal scroll of `110×165px` MediaPoster cards, `border-radius: 10px`, `gap: 12px`

---

## Collection

- Implemented under `src/app/(app)/collection/` via `Page` (server component) and `MyMedia` (client component).

Layout & Header

- Header area: eyebrow `font-mono text-sm tracking-[0.2em] text-mint uppercase` and heading `font-serif text-[clamp(32px,5vw,48px)]`.
- Tabs: `Watched` / `To Watch` are Link buttons styled with rounded-[10px], `px-4.5 py-1.75`, active uses `bg-mint text-dark`.
- Filter: `Input` with `variant="search"` placed in top-right controls; `Select` (MEDIA_TYPE_OPTIONS) for media type filtering.
- Search filter is debounced via `useSearch` hook.

List & Cards

- `UserMediaList` (client) fetches paginated data via `useUserMedia` and renders `MediaList`.
- `MediaList` uses a responsive CSS grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5`.
- Cards are `MediaCard` components with `rounded-xl`, `border border-white/[0.07]`, `aspect-2/3`.
- Empty state shows a centered `font-mono text-sm` message.
- Pagination uses IntersectionObserver to fetch next pages and shows `Loader` while loading.

Notes

- Title and counts are derived server-side; the right-side count label is omitted in favor of a prominent heading.

---

## Movie Detail

- Implemented via `src/app/(movie|series)/[slug]/page.tsx` → `MediaPage` → `MediaDetail`.

Overall structure

- `MediaPage` is an async route loader using the PPR pattern. It `await`s the cached TMDB fetch (`getMovieDetails`/`getSeriesDetails`, both `use cache` + `cacheLife('days')` + `cacheTag`) directly, so the static shell prerenders with TMDB data. It then wraps the user-enriched subtree in `<Suspense>` while `getEnrichedMedia` reads cookies + Supabase.
- The Suspense fallback renders `<MediaDetail media={baseMedia} pending />` — the full detail UI with the action buttons replaced by `Skeleton` blocks (`MediaInfo` `pending` prop, `aria-busy="true"`). Once `UserEnrichedMedia` resolves, the real `MediaDetail` (with `watchStatus` if saved) replaces it.
- `MediaDetail` orchestrates `infoSlot` vs `formSlot` using `useDetailStep` (step 1 = info, 2 = form). It detects saved state by checking `watchStatus` in the media object.
- `MediaDetailWrapper` provides the backdrop layers and two-column layout. Left poster column is `hidden` on small screens (`hidden md:flex w-1/2`) and contains `MediaPoster`.
- The cinematic backdrop (blue radial + dark linear overlay) is `fixed inset-0` so it covers the full viewport — header and `main` share the same gradient, no visible seam between them. The backdrop's `bg-dark` base layer makes it fully opaque, hiding the `(app)` layout's ambient blobs on movie/series pages so the header (transparent) and `main` (MediaDetailWrapper `bg-dark`) render identically. `MediaDetailSkeleton` mirrors this so the streamed skeleton matches.
- On home (and other non-cinematic routes) the `(app)` layout's ambient blobs show only in the 56px `Header` strip because `main` is opaque `bg-dark`; that subtle soft transition reads as one continuous background.

Poster & Visuals

- `MediaPoster` is a rotated card (`-1.5deg`), `rounded-2xl`, heavy drop shadow and inset vignette. Uses placeholder gradient when no poster.
- Backdrop gradients and vignette overlays are implemented in `MediaDetailWrapper` via absolute `bg-[radial-gradient(...)]` and `bg-[linear-gradient(...)]` utilities.

Info & Form

- Info view (`MediaInfo` or `WatchedMediaInfo`) shows:
  - Back link `← BACK TO COLLECTION` (font-mono, text-sm, tracking-[0.12em]).
  - Genre pills (when available): flex-wrap row of `font-mono text-sm tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border border-secondary/25 text-mint` spans. Placed above the type label.
  - Eyebrow (type) using `font-mono text-sm tracking-[0.22em] text-secondary uppercase`.
  - Title: `font-serif` with inline style `fontSize: 'clamp(42px, 5.5vw, 72px)'`, `tracking-[-0.03em]`, `leading-[0.95]`.
  - Meta row: director label `font-mono text-sm tracking-[0.08em]` and date `font-mono text-sm`.
  - Mint divider `w-12 h-px bg-mint opacity-60`.
  - Overview text (when available): `text-sm text-primary leading-relaxed mb-8`, placed below the mint divider and above the action buttons (or above the rating section in `WatchedMediaInfo`).
  - Action buttons: `Button` (mint filled or outlined). Add/remove flows call `addUserMedia` / `deleteUserMedia` and invalidate queries via react-query.

- Watched view (`WatchedMediaInfo`) shows rating (uses `StarRating`), formatted watched date, and review text. Includes an Update button that switches to the form.

- Form view (`UserEntryForm`) uses `react-hook-form` and includes:
  - DatePicker (`DatePicker`) for `watched_date` (disables future dates).
  - Rating input (`Input` variant `rating`) validated 0–10.
  - Review textarea (`Textarea`) with maxLength 1000.
  - Submit calls `addUserMedia` (create) or `updateUserMedia` (update) and invalidates user media queries. On success it navigates or toggles back to info.

Recommendations ("More Like This")

- Rendered in `MediaDetailWrapper` below the two-column layout, only on step 1 and when `recommendations` array is non-empty.
- Section label: `font-mono text-sm tracking-[0.2em] text-secondary uppercase`.
- Horizontal scroll row (`flex gap-3 overflow-x-auto pb-1`) matching the home page "Recently Watched" pattern.
- Each card: `w-27.5 h-41.25 rounded-xl overflow-hidden border border-white/[0.07]` with `MediaPoster` inside.
- Genre badge overlay: `font-mono text-sm` in a `bg-dark/70 text-mint` pill at bottom-left of the card.
- Title below card: `text-sm text-secondary truncate`, transitions to `text-primary` on hover.
- Cards link to `/movie/{id}-{slug}` or `/series/{id}-{slug}`.
- Padding: `px-6 md:px-12 pb-8`.

Interactions & Accessibility

- `MediaCard` and detail actions use Links/Buttons with clear focus and hover states.
- Keyboard and mouse interactions are handled in dropdowns and selects (accessible listbox behavior in `Select`).

---

## Profile

- Implemented via `src/app/(app)/profile/page.tsx` (server) → `ProfileContent.tsx` (client).
- Route: `/profile` (private, auth required).

Layout

- Centered single column `max-w-xl px-6 py-10 md:py-16`, vertically centered via `min-h-full flex flex-col justify-center`.
- Entry animation: `animate-fade-up`.
- Heading: `font-serif text-4xl md:text-5xl` with mint emphasis (`<em class="text-mint">`): "Your _Profile_".

Profile Card

- `bg-bg2 border border-secondary/25 rounded-2xl p-6`, horizontal flex with `gap-6`.
- Avatar: `w-22 h-22 rounded-full border-2 border-mint` with overflow hidden. Shows uploaded image or serif initials fallback (`font-serif text-3xl`).
- Edit avatar button: absolute-positioned circle (`w-7 h-7 rounded-full bg-bg2 border border-secondary/50`) with mint pencil SVG icon. Triggers hidden file input.
- Avatar upload: client-side validation (JPEG/PNG/WebP/GIF, max 1 MB), uploads to Supabase `avatar` bucket at `{user_id}/avatar.{ext}`, calls `updateAvatarPath` service.
- Display name: `font-mono text-sm uppercase tracking-[0.15em] text-secondary` label. Name shown as `text-2xl font-sans font-semibold` with pencil edit icon.
- Inline edit mode: `Input` component with Save (`text-mint font-mono uppercase`) and Cancel buttons. Enter saves, Escape cancels. Max 50 characters.

Account Card

- `bg-bg2 border border-white/[0.07] rounded-2xl p-6`.
- Section header: `font-mono text-base uppercase tracking-[0.15em] text-secondary`.
- Collapsible rows use `ChevronIcon` that rotates on open/close (`rotate-90` / `-rotate-90`).

- **Email row**: shows current email, expands to `Input` for new email + `Button` "Update email". Calls `updateEmail` service.
- **Password row**: shows `••••••••` when collapsed. Expands to three inputs (current, new, confirm) + `Button` "Update password". Calls `updatePassword` service.

Danger Zone Card

- `bg-bg2 border border-red-400/20 rounded-2xl p-6`.
- Header: `font-mono text-base uppercase tracking-[0.15em] text-red-400`.
- Collapsible delete section with confirmation: user must type "DELETE" in input.
- Delete button: `bg-red-800 hover:bg-red-900 text-primary`. Calls `deleteAccount` service.

Sign Out

- Centered `Button` with `variant="outlined"` and `px-16`. Calls `logout` service.

Services

- `services/getProfile.ts` — fetches user profile (server-side).
- `services/updateProfile.ts` — `updateDisplayName` and `updateAvatarPath` functions.
- `services/account.ts` — `updateEmail`, `updatePassword`, `deleteAccount` functions.
- `services/auth.ts` — `logout` function (shared with other pages).

---

## Terms and Privacy

Static legal pages, open routes (no auth required).

### Terms (`/terms`)

- `src/app/(app)/terms/page.tsx` — server component, no data fetching.
- Layout: `min-h-full px-6 md:px-12 py-12`, `max-w-2xl mx-auto`.
- Title: `font-serif text-3xl sm:text-4xl text-primary`.
- Subtitle label: `font-mono text-sm text-secondary tracking-widest uppercase`.
- Section headings: `font-mono text-sm tracking-[0.15em] text-mint uppercase`.
- Body text: `font-sans text-base text-secondary leading-relaxed`.
- Sections: Acceptance, Use of Service, User-Generated Content, Account Termination, Disclaimer, Changes.

### Privacy (`/privacy`)

- `src/app/(app)/privacy/page.tsx` — server component, no data fetching.
- Same layout and typography as `/terms`.
- Sections: What We Collect, How We Use It, Storage, Analytics, Data Retention, Your Rights, Contact.

---

## Error & Not-Found Pages

- `(app)/error.tsx` and `(app)/not-found.tsx` render inside the (app) layout (Header visible). Root `src/app/not-found.tsx` is full-screen with its own bg and ambient gradients.
- No card/panel. Centered content column with soft radial glow: mint for 404, red for error.
- 56px icon above eyebrow: `ClapperboardIcon` (mint) for 404, `AlertCircleIcon` (red) for error.
- Eyebrow: mono small uppercase. Title: serif display with one italicized accent word.
- Actions use pill-shaped buttons — 404: single "Back to home" link; Error: "Try again" (`reset()`) + "Go home".
