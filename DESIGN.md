# cineCircle — Design System & Screen Specs

> **This document is a complete design reference** for implementing the cineCircle app UI in a React codebase.

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
    fontSize: 52,
    fontWeight: 400,
    letterSpacing: '-0.03em',
    lineHeight: 0.95,
  },
  sectionTitle: {
    fontFamily: fonts.serif,
    fontSize: 48,
    fontWeight: 400,
    letterSpacing: '-0.03em',
    lineHeight: 0.95,
  },
  loginTitle: {
    fontFamily: fonts.serif,
    fontSize: 36,
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
    // Buttons use text-base (16px) for medium and text-sm (14px) for small
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '0.08em',
  },
};
```

### Spacing & Layout

```ts
export const layout = {
  topBarHeight: 56,
  pagePadH: 48, // horizontal page padding
  gap_sm: 8,
  gap_md: 12,
  gap_lg: 20,
  gap_xl: 32,
};
```

### Border Radius

```ts
export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
};
```

### Shadows

```ts
export const shadows = {
  poster: '0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07)',
  stacked: '0 24px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)',
};
```

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

### CinematicPoster

- `src/components/CinematicPoster.tsx`.
- Shows poster image or gradient placeholder.
- Top fade overlay and optional vignette.
- Bottom textual metadata is commented out; callers provide layout and aspect ratio (typically 2/3).

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
- Colors: `mint` (default), `primary`, `secondary`.
- Sizes: `medium` (h-12 text-base) and `small` (h-10 text-sm).
- Uses `uppercase tracking-[0.08em] font-semibold` and merges custom classes via `twMerge`.

### Loader

- `src/components/Loader.tsx`.
- Simple spinner using a bordered circle with `animate-spin`.
- Accepts `fullScreen` prop to fill container height.

### ErrorToast

- `src/components/ErrorToast.tsx`.
- Shows a toast.error when mounted via `react-toastify`.

---

---

## Login/Register

- Implemented by `src/app/(auth)/AuthFormLayout.tsx` with `LoginForm` and `RegisterForm` as children.
- Layout: fixed two-column auth shell (`fixed inset-0 flex`). Left column contains the form; right column (desktop) shows a 3×2 grid of `CinematicPoster` tiles fetched from `getTrendingMovies()`.

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
- 3×2 grid of `CinematicPoster` components; each tile fills its cell.
- Two overlay gradients: a right-to-left dark fade and a top/bottom vignette applied via absolute layers.
- Top-left logo (26×26) and `font-mono` wordmark are positioned absolutely.

---

## Search / Home

- Implemented in `src/app/(private)/page.tsx`.

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

- Uses `getUserMediaList('watched')` to build `recentPosters` and renders a horizontal `overflow-x-auto` strip of `CinematicPoster` links.
- Each poster link: `shrink-0 rounded-[10px] overflow-hidden border border-white/[0.07] w-27.5 h-41.25` (sized for 110×165px posters).
- Section header: left label `font-mono text-sm tracking-[0.2em] text-secondary uppercase` and right-side `SEE ALL →` link `font-mono text-sm text-mint tracking-[0.08em]`.

- Label "RECENTLY WATCHED" DM Mono 14px secondary + "SEE ALL →" mint
- Horizontal scroll of `110×165px` CinematicPoster cards, `border-radius: 10px`, `gap: 12px`

---

## Collection

- Implemented under `src/app/(private)/my-media/` via `Page` (server component) and `MyMedia` (client component).

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

- `MediaPage` is an async route loader that calls `getMediaPageData` and renders `ErrorToast` on error or `MediaDetail` on success.
- `MediaDetail` orchestrates `infoSlot` vs `formSlot` using `useDetailStep` (step 1 = info, 2 = form). It detects saved state by checking `watchStatus` in the media object.
- `MediaDetailWrapper` provides the backdrop layers and two-column layout. Left poster column is `hidden` on small screens (`hidden md:flex w-1/2`) and contains `MediaPoster`.

Poster & Visuals

- `MediaPoster` is a rotated card (`-1.5deg`), `rounded-2xl`, heavy drop shadow and inset vignette. Uses placeholder gradient when no poster.
- Backdrop gradients and vignette overlays are implemented in `MediaDetailWrapper` via absolute `bg-[radial-gradient(...)]` and `bg-[linear-gradient(...)]` utilities.

Info & Form

- Info view (`MediaInfo` or `WatchedMediaInfo`) shows:
  - Back link `← BACK TO COLLECTION` (font-mono, text-sm, tracking-[0.12em]).
  - Eyebrow (type) using `font-mono text-xs tracking-[0.22em] text-mint uppercase`.
  - Title: `font-serif` with inline style `fontSize: 'clamp(42px, 5.5vw, 72px)'`, `tracking-[-0.03em]`, `leading-[0.95]`.
  - Meta row: director label `font-mono text-xs tracking-[0.08em]` and date `font-mono text-[13px]`.
  - Mint divider `w-12 h-px bg-mint opacity-60`.
  - Action buttons: `Button` (mint filled or outlined). Add/remove flows call `addUserMedia` / `deleteUserMedia` and invalidate queries via react-query.

- Watched view (`WatchedMediaInfo`) shows rating (uses `StarRating`), formatted watched date, and review text. Includes an Update button that switches to the form.

- Form view (`UserEntryForm`) uses `react-hook-form` and includes:
  - DatePicker (`DatePicker`) for `watched_date` (disables future dates).
  - Rating input (`Input` variant `rating`) validated 0–10.
  - Review textarea (`Textarea`) with maxLength 1000.
  - Submit calls `addUserMedia` (create) or `updateUserMedia` (update) and invalidates user media queries. On success it navigates or toggles back to info.

Interactions & Accessibility

- `MediaCard` and detail actions use Links/Buttons with clear focus and hover states.
- Keyboard and mouse interactions are handled in dropdowns and selects (accessible listbox behavior in `Select`).
